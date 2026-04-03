import { Assessment } from "../models/Assessment.js";
import { addAssessmentSchema } from "../schemas/assessment.schema.js";



// ADD ASSESSMENT
const addAssessmentController = async (req, res, next) => {
    try {

        const parsed = addAssessmentSchema.safeParse(req.body);
        if (!parsed.success) return next(parsed.error);

        const userId = req.user?.id;
        if (!userId) {
            const err = new Error("Unauthorized.");
            err.statusCode = 401;
            throw err;
        }

        const assessment = await Assessment.create({
            userId,
            ...parsed.data,
            date: new Date(parsed.data.date),
        });

        return res.status(201).json({
            success: true,
            message: "Assessment saved successfully.",
            assessment,
        });

    } catch (err) {
        next(err);
    }
};



// GET ALL ASSESSMENTS (logged-in user ke)
const getAssessmentsController = async (req, res, next) => {
    try {

        const userId = req.user?.id;
        if (!userId) {
            const err = new Error("Unauthorized.");
            err.statusCode = 401;
            throw err;
        }

        const assessments = await Assessment.find({ userId })
            .sort({ date: -1 }) // newest first
            .lean();

        return res.status(200).json({
            success: true,
            count: assessments.length,
            assessments,
        });

    } catch (err) {
        next(err);
    }
};



// DELETE ASSESSMENT
const deleteAssessmentController = async (req, res, next) => {
    try {

        const userId = req.user?.id;
        if (!userId) {
            const err = new Error("Unauthorized.");
            err.statusCode = 401;
            throw err;
        }

        const { id } = req.params;
        if (!id) {
            const err = new Error("Assessment ID is required.");
            err.statusCode = 400;
            throw err;
        }

        const assessment = await Assessment.findOneAndDelete({ _id: id, userId });

        if (!assessment) {
            const err = new Error("Assessment not found.");
            err.statusCode = 404;
            throw err;
        }

        return res.status(200).json({
            success: true,
            message: "Assessment deleted successfully.",
        });

    } catch (err) {
        next(err);
    }
};



export { addAssessmentController, getAssessmentsController, deleteAssessmentController };
