import type { Task } from '@/types/assessment';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TASKS: Task[] = [
  { id: 'laundry', name: 'Laundry', icon: 'shirt-outline' },
  { id: 'cooking', name: 'Cooking', icon: 'flame-outline' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
  { id: 'grocery', name: 'Grocery Shopping', icon: 'cart-outline' },
  { id: 'dishwashing', name: 'Dishwashing', icon: 'water-outline' },
  { id: 'ironing', name: 'Ironing', icon: 'color-wand-outline' },
  { id: 'vacuuming', name: 'Vacuuming', icon: 'refresh-outline' },
  { id: 'mopping', name: 'Mopping', icon: 'reorder-four-outline' },
  { id: 'gardening', name: 'Gardening', icon: 'leaf-outline' },
  { id: 'bed_making', name: 'Making Bed', icon: 'bed-outline' },
  { id: 'personal_care', name: 'Personal Care', icon: 'heart-outline' },
  { id: 'custom', name: 'Custom Task', icon: 'add-circle-outline' },
];

export default function TaskSelectionScreen() {
  const router = useRouter();
  const [customVisible, setCustomVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const inputRef = useRef<TextInput>(null);

  function selectTask(task: Task) {
    if (task.id === 'custom') {
      setCustomName('');
      setCustomVisible(true);
      return;
    }
    navigate(task.id, task.name);
  }

  function navigate(taskId: string, taskName: string) {
    router.push({
      pathname: '/(main)/assess/details',
      params: { taskId, taskName },
    });
  }

  function handleCustomConfirm() {
    const name = customName.trim();
    if (!name) return;
    setCustomVisible(false);
    navigate('custom', name);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px]" style={styles.heroShadow}>
        <Text className="font-osmd text-white/70 text-sm mb-1">Step 1 of 6</Text>
        <Text className="font-osbd text-white text-2xl">Select a Task</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">Which household task did you do?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40 }}
      >
        <View className="flex-row flex-wrap gap-3">
          {TASKS.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => selectTask(task)}
              activeOpacity={0.82}
              style={[styles.taskCard, { width: '47%' }]}
              className={`bg-white rounded-2xl p-4 items-center ${task.id === 'custom' ? 'border-2 border-dashed border-primary-300' : ''}`}
            >
              <View className="w-12 h-12 rounded-md bg-primary-50 items-center justify-center mb-3">
                <Ionicons name={task.icon as any} size={24} color="#2563EB" />
              </View>
              <Text className="font-osbd text-text font-semibold text-center text-sm">{task.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Custom Task Modal */}
      <Modal
        visible={customVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomVisible(false)}
        onShow={() => setTimeout(() => inputRef.current?.focus(), 100)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center gap-2">
                <View className="w-9 h-9 rounded-lg bg-primary-50 items-center justify-center">
                  <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
                </View>
                <Text className="font-osbd text-text text-lg">Custom Task</Text>
              </View>
              <TouchableOpacity onPress={() => setCustomVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text className="font-osbd text-text-secondary text-xs mb-2 ml-1">Task Name</Text>
            <View className="flex-row items-center border-2 border-primary rounded-lg px-4 py-3 mb-6 bg-primary-50">
              <Ionicons name="pencil-outline" size={16} color="#2563EB" />
              <TextInput
                ref={inputRef}
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. Watering plants, Fixing shelves..."
                placeholderTextColor="#94A3B8"
                className="font-osmd flex-1 text-text ml-3"
                style={{ paddingVertical: 0 }}
                autoCapitalize="words"
                maxLength={50}
                onSubmitEditing={handleCustomConfirm}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              onPress={handleCustomConfirm}
              disabled={!customName.trim()}
              activeOpacity={0.86}
              className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${customName.trim() ? 'bg-primary' : 'bg-primary-300'}`}
              style={customName.trim() ? styles.btnShadow : undefined}
            >
              <Text className="font-osbd text-white text-base">Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  taskCard: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
