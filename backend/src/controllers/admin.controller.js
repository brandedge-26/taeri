import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { Assessment } from "../models/Assessment.js";
import { generateAccessToken } from "../utils/token.js";

// Admin Login
export const adminLoginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required." });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || user.role !== "admin") {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const accessToken = generateAccessToken({ id: user._id, role: "admin" });

        return res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Get Overview Stats
export const adminGetStatsController = async (req, res, next) => {
    try {
        const [totalUsers, totalAssessments, riskDist, recentUsers] = await Promise.all([
            User.countDocuments({ role: { $ne: "admin" } }),
            Assessment.countDocuments(),
            Assessment.aggregate([
                { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
            ]),
            User.find({ role: { $ne: "admin" } })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name email age livingSituation createdAt"),
        ]);

        const riskMap = { green: 0, yellow: 0, red: 0 };
        for (const r of riskDist) {
            if (r._id in riskMap) riskMap[r._id] = r.count;
        }

        return res.status(200).json({
            success: true,
            totalUsers,
            totalAssessments,
            riskDistribution: riskMap,
            recentUsers,
        });
    } catch (err) {
        next(err);
    }
};

// Get All Users
export const adminGetUsersController = async (req, res, next) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } })
            .sort({ createdAt: -1 })
            .select("name email age livingSituation provider createdAt");

        // Get assessment counts + avg score per user
        const userIds = users.map(u => u._id);
        const aggResult = await Assessment.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: "$userId", count: { $sum: 1 }, avgScore: { $avg: "$finalScore" } } },
        ]);
        const aggMap = Object.fromEntries(
            aggResult.map(r => [r._id.toString(), { count: r.count, avgScore: r.avgScore }])
        );

        function scoreToRisk(avg) {
            if (avg < 1.6)  return "green";
            if (avg <= 5.0) return "yellow";
            return "red";
        }

        const result = users.map(u => {
            const agg = aggMap[u._id.toString()];
            const avgScore = agg ? parseFloat(agg.avgScore.toFixed(2)) : null;
            return {
                _id: u._id,
                name: u.name,
                email: u.email,
                age: u.age,
                livingSituation: u.livingSituation,
                provider: u.provider,
                createdAt: u.createdAt,
                assessmentCount: agg?.count ?? 0,
                avgScore,
                overallRisk: avgScore !== null ? scoreToRisk(avgScore) : null,
            };
        });

        return res.status(200).json({ success: true, users: result });
    } catch (err) {
        next(err);
    }
};

// Delete User
export const adminDeleteUserController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found." });
        if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin." });
        await Assessment.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "User deleted." });
    } catch (err) {
        next(err);
    }
};

// Get All Assessments
export const adminGetAssessmentsController = async (req, res, next) => {
    try {
        const assessments = await Assessment.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name email")
            .limit(500);

        return res.status(200).json({ success: true, assessments });
    } catch (err) {
        next(err);
    }
};

// Get Assessments for a specific user
export const adminGetUserAssessmentsController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const assessments = await Assessment.find({ userId: id })
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, assessments });
    } catch (err) {
        next(err);
    }
};

// Get At-Risk Patients (yellow + red)
export const adminGetAtRiskPatientsController = async (req, res, next) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } })
            .select("name email age livingSituation createdAt");

        const userIds = users.map(u => u._id);
        const aggResult = await Assessment.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: "$userId", count: { $sum: 1 }, avgScore: { $avg: "$finalScore" }, lastDate: { $max: "$createdAt" } } },
        ]);
        const aggMap = Object.fromEntries(
            aggResult.map(r => [r._id.toString(), r])
        );

        function scoreToRisk(avg) {
            if (avg < 1.6)  return "green";
            if (avg <= 5.0) return "yellow";
            return "red";
        }

        const atRisk = users
            .map(u => {
                const agg = aggMap[u._id.toString()];
                if (!agg) return null;
                const avgScore = parseFloat(agg.avgScore.toFixed(2));
                const risk = scoreToRisk(avgScore);
                if (risk === "green") return null;
                return {
                    _id: u._id,
                    name: u.name,
                    email: u.email,
                    age: u.age,
                    livingSituation: u.livingSituation,
                    assessmentCount: agg.count,
                    avgScore,
                    riskLevel: risk,
                    lastAssessment: agg.lastDate,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.avgScore - a.avgScore);

        return res.status(200).json({ success: true, patients: atRisk });
    } catch (err) {
        next(err);
    }
};

// Change Admin Password
export const adminChangePasswordController = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both fields are required." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters." });
        }

        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(404).json({ message: "Admin not found." });

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });

        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        return res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        next(err);
    }
};

// Get High-Risk Alerts (red assessments with user info)
export const adminGetAlertsController = async (req, res, next) => {
    try {
        const alerts = await Assessment.find({ riskLevel: "red" })
            .sort({ createdAt: -1 })
            .populate("userId", "name email age livingSituation")
            .limit(200);

        const result = alerts.map(a => ({
            _id: a._id,
            taskName: a.taskName,
            finalScore: a.finalScore,
            riskLevel: a.riskLevel,
            stability: a.stability,
            weekNumber: a.weekNumber,
            date: a.date,
            createdAt: a.createdAt,
            user: a.userId
                ? { _id: a.userId._id, name: a.userId.name, email: a.userId.email, age: a.userId.age, livingSituation: a.userId.livingSituation }
                : null,
        }));

        return res.status(200).json({ success: true, alerts: result, total: result.length });
    } catch (err) {
        next(err);
    }
};

// Get Single User
export const adminGetSingleUserController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("name email age livingSituation provider createdAt role");
        if (!user || user.role === "admin") return res.status(404).json({ message: "User not found." });

        const aggResult = await Assessment.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, count: { $sum: 1 }, avgScore: { $avg: "$finalScore" }, minScore: { $min: "$finalScore" }, maxScore: { $max: "$finalScore" }, lastDate: { $max: "$date" } } },
        ]);
        const agg = aggResult[0];
        const avgScore = agg ? parseFloat(agg.avgScore.toFixed(2)) : null;

        function scoreToRisk(s) {
            if (s < 1.6) return "green";
            if (s <= 5.0) return "yellow";
            return "red";
        }

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                livingSituation: user.livingSituation,
                provider: user.provider,
                createdAt: user.createdAt,
                assessmentCount: agg?.count ?? 0,
                avgScore,
                lowestScore: agg ? parseFloat(agg.minScore.toFixed(2)) : null,
                highestScore: agg ? parseFloat(agg.maxScore.toFixed(2)) : null,
                lastAssessmentDate: agg?.lastDate ?? null,
                overallRisk: avgScore !== null ? scoreToRisk(avgScore) : null,
            }
        });
    } catch (err) {
        next(err);
    }
};

// Delete Assessment
export const adminDeleteAssessmentController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const assessment = await Assessment.findByIdAndDelete(id);
        if (!assessment) return res.status(404).json({ message: "Assessment not found." });
        return res.status(200).json({ success: true, message: "Assessment deleted." });
    } catch (err) {
        next(err);
    }
};
