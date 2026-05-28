export type WorkoutCategory =
  | "Full Body"
  | "Weight Loss"
  | "Toning"
  | "Abs"
  | "Upper Body"
  | "Lower Body"
  | "Beginner"
  | "Advanced";

export type Workout = {
  id: string;
  title: string;
  category: WorkoutCategory;
  durationMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  caloriesBurned: number;
  description: string;
  thumbnailColor: string;
  thumbnailImage: string;
  exercises: Exercise[];
};

export type Exercise = {
  name: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
  instructions: string;
};

export const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  "Full Body",
  "Weight Loss",
  "Toning",
  "Abs",
  "Upper Body",
  "Lower Body",
  "Beginner",
  "Advanced",
];

export const WORKOUTS: Workout[] = [
  {
    id: "w001",
    title: "Total Body Burn",
    category: "Full Body",
    durationMinutes: 30,
    difficulty: "Intermediate",
    caloriesBurned: 280,
    description:
      "A complete full-body workout designed to torch calories and build lean muscle. Perfect for busy days when you want maximum results in minimum time.",
    thumbnailColor: "#E8A0B4",
    thumbnailImage: "https://images.unsplash.com/photo-1552252396082-f0a9b1bf6b3a?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Jumping Jacks",
        durationSeconds: 45,
        restSeconds: 15,
        instructions: "Start with feet together and arms at your sides. Jump up with arms and legs wide, then return.",
      },
      {
        name: "Bodyweight Squats",
        sets: 3,
        reps: 15,
        restSeconds: 20,
        instructions: "Stand with feet shoulder-width apart. Lower hips back and down, keeping chest tall.",
      },
      {
        name: "Push-Ups",
        sets: 3,
        reps: 10,
        restSeconds: 20,
        instructions: "Start in plank position. Lower chest to floor, keeping core tight, then press back up.",
      },
      {
        name: "Mountain Climbers",
        durationSeconds: 30,
        restSeconds: 15,
        instructions: "In plank position, alternate driving knees toward chest in a running motion.",
      },
      {
        name: "Glute Bridges",
        sets: 3,
        reps: 20,
        restSeconds: 15,
        instructions: "Lie on back, feet flat, knees bent. Push hips toward ceiling, squeezing glutes at top.",
      },
    ],
  },
  {
    id: "w002",
    title: "Fat Blaster HIIT",
    category: "Weight Loss",
    durationMinutes: 20,
    difficulty: "Intermediate",
    caloriesBurned: 300,
    description:
      "High-intensity intervals designed to maximize fat burning and boost metabolism. Short but incredibly effective.",
    thumbnailColor: "#D4A574",
    thumbnailImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Burpees",
        durationSeconds: 30,
        restSeconds: 10,
        instructions: "From standing, drop to plank, do a push-up, jump feet to hands, then explode upward.",
      },
      {
        name: "High Knees",
        durationSeconds: 45,
        restSeconds: 15,
        instructions: "Run in place, driving knees as high as possible. Pump arms for intensity.",
      },
      {
        name: "Jump Squats",
        durationSeconds: 30,
        restSeconds: 10,
        instructions: "Squat down, then explode upward into a jump. Land softly and immediately drop into next squat.",
      },
      {
        name: "Speed Skaters",
        durationSeconds: 45,
        restSeconds: 15,
        instructions: "Leap side to side like a speed skater, touching the floor with opposite hand.",
      },
      {
        name: "Plank Jacks",
        durationSeconds: 30,
        restSeconds: 10,
        instructions: "In plank position, jump feet wide and back together like jumping jacks.",
      },
    ],
  },
  {
    id: "w003",
    title: "Sculpt & Tone",
    category: "Toning",
    durationMinutes: 35,
    difficulty: "Intermediate",
    caloriesBurned: 220,
    description:
      "Targeted toning exercises that define and sculpt every muscle group. High reps, low rest for that lean, toned look.",
    thumbnailColor: "#B8D4B0",
    thumbnailImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Lateral Lunges",
        sets: 3,
        reps: 12,
        restSeconds: 20,
        instructions: "Step wide to one side, bending that knee deeply. Keep opposite leg straight. Return to center.",
      },
      {
        name: "Tricep Dips",
        sets: 3,
        reps: 15,
        restSeconds: 20,
        instructions: "Using a chair, lower yourself by bending elbows to 90 degrees, then press back up.",
      },
      {
        name: "Side-Lying Leg Raises",
        sets: 3,
        reps: 20,
        restSeconds: 15,
        instructions: "Lie on side, lift top leg upward. Control the movement both ways.",
      },
      {
        name: "Sumo Squats",
        sets: 3,
        reps: 15,
        restSeconds: 20,
        instructions: "Stand wide with toes out. Squat deeply, keeping chest tall. Squeeze glutes on the way up.",
      },
    ],
  },
  {
    id: "w004",
    title: "Core Crush",
    category: "Abs",
    durationMinutes: 15,
    difficulty: "Beginner",
    caloriesBurned: 120,
    description:
      "A focused ab workout that targets your entire core — upper abs, lower abs, obliques, and deep stabilizers.",
    thumbnailColor: "#A8C4E0",
    thumbnailImage: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Crunches",
        sets: 3,
        reps: 20,
        restSeconds: 15,
        instructions: "Lie on back, knees bent. Curl shoulders off ground, engaging core. Lower slowly.",
      },
      {
        name: "Bicycle Crunches",
        sets: 3,
        reps: 16,
        restSeconds: 15,
        instructions: "Alternate touching opposite elbow to knee while extending other leg. Slow and controlled.",
      },
      {
        name: "Plank Hold",
        durationSeconds: 30,
        restSeconds: 15,
        instructions: "Hold forearm plank, body straight as a board. Squeeze everything — abs, glutes, quads.",
      },
      {
        name: "Leg Raises",
        sets: 3,
        reps: 12,
        restSeconds: 20,
        instructions: "Lying flat, keep legs straight and raise them to 90 degrees, then lower slowly without touching floor.",
      },
      {
        name: "Russian Twists",
        sets: 3,
        reps: 20,
        restSeconds: 15,
        instructions: "Sit at 45 degrees, feet off floor. Rotate torso side to side, tapping floor each way.",
      },
    ],
  },
  {
    id: "w005",
    title: "Upper Body Strength",
    category: "Upper Body",
    durationMinutes: 25,
    difficulty: "Intermediate",
    caloriesBurned: 180,
    description:
      "Build beautiful upper body strength — toned arms, shoulders, chest and back. No equipment needed.",
    thumbnailColor: "#F0B4C8",
    thumbnailImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Wide Push-Ups",
        sets: 3,
        reps: 12,
        restSeconds: 30,
        instructions: "Push-ups with hands placed wider than shoulder-width to target chest more.",
      },
      {
        name: "Diamond Push-Ups",
        sets: 3,
        reps: 8,
        restSeconds: 30,
        instructions: "Hands form a diamond shape under chest. Targets triceps intensely.",
      },
      {
        name: "Pike Push-Ups",
        sets: 3,
        reps: 10,
        restSeconds: 30,
        instructions: "In downward dog position, lower head toward floor by bending elbows. Targets shoulders.",
      },
      {
        name: "Superman Hold",
        durationSeconds: 20,
        restSeconds: 15,
        instructions: "Lie face down. Lift arms, chest, and legs simultaneously. Hold the position.",
      },
    ],
  },
  {
    id: "w006",
    title: "Lower Body Lift",
    category: "Lower Body",
    durationMinutes: 30,
    difficulty: "Intermediate",
    caloriesBurned: 240,
    description:
      "Grow and shape your glutes, hamstrings, and quads with this targeted lower body routine. Your legs will thank you.",
    thumbnailColor: "#C4B0D4",
    thumbnailImage: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Romanian Deadlifts",
        sets: 3,
        reps: 12,
        restSeconds: 30,
        instructions: "Hinge at hips, keeping back flat and legs nearly straight. Feel the hamstring stretch.",
      },
      {
        name: "Walking Lunges",
        sets: 3,
        reps: 16,
        restSeconds: 20,
        instructions: "Step forward into lunge, back knee nearly touching floor. Alternate legs continuously.",
      },
      {
        name: "Donkey Kicks",
        sets: 3,
        reps: 20,
        restSeconds: 15,
        instructions: "On all fours, kick one leg up and back, squeezing glute at top. Keep core tight.",
      },
      {
        name: "Calf Raises",
        sets: 3,
        reps: 25,
        restSeconds: 15,
        instructions: "Rise up on toes as high as possible, then lower slowly. Can do single leg for more challenge.",
      },
    ],
  },
  {
    id: "w007",
    title: "Gentle Start",
    category: "Beginner",
    durationMinutes: 20,
    difficulty: "Beginner",
    caloriesBurned: 130,
    description:
      "The perfect starting point for your fitness journey. Build confidence and establish movement patterns with this gentle but effective routine.",
    thumbnailColor: "#B4D4C4",
    thumbnailImage: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Marching in Place",
        durationSeconds: 60,
        restSeconds: 20,
        instructions: "Simply march, lifting knees comfortably. Swing your arms naturally. Easy does it!",
      },
      {
        name: "Wall Push-Ups",
        sets: 2,
        reps: 10,
        restSeconds: 20,
        instructions: "Stand arm's length from wall. Press into wall and push back. Very gentle variation.",
      },
      {
        name: "Seated Leg Extensions",
        sets: 2,
        reps: 15,
        restSeconds: 15,
        instructions: "Sitting in chair, extend one leg straight, hold 2 seconds, lower. Alternate legs.",
      },
      {
        name: "Standing Side Bends",
        sets: 2,
        reps: 10,
        restSeconds: 15,
        instructions: "Stand tall, lean to each side slowly. Stretches obliques and feels great.",
      },
    ],
  },
  {
    id: "w008",
    title: "Advanced Shred",
    category: "Advanced",
    durationMinutes: 45,
    difficulty: "Advanced",
    caloriesBurned: 420,
    description:
      "Elite-level training for those ready to push their limits. Brutal circuits designed for maximum results. Not for the faint-hearted.",
    thumbnailColor: "#E0A0A0",
    thumbnailImage: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop&auto=format&q=80",
    exercises: [
      {
        name: "Plyometric Push-Ups",
        sets: 4,
        reps: 10,
        restSeconds: 30,
        instructions: "Explosive push-up where hands leave the ground at the top. Land softly, absorb impact.",
      },
      {
        name: "Tuck Jumps",
        sets: 4,
        reps: 15,
        restSeconds: 20,
        instructions: "Jump as high as possible, bringing knees to chest mid-air. Land softly.",
      },
      {
        name: "Single-Leg Burpees",
        sets: 3,
        reps: 8,
        restSeconds: 30,
        instructions: "Burpee performed with one leg throughout. Alternate legs each set.",
      },
      {
        name: "Pistol Squats (Assisted)",
        sets: 3,
        reps: 6,
        restSeconds: 45,
        instructions: "Single-leg squat, hold something for balance if needed. Full depth, chest tall.",
      },
    ],
  },
];

export function getWorkoutsByCategory(category: WorkoutCategory): Workout[] {
  return WORKOUTS.filter((w) => w.category === category);
}

export function getWorkoutById(id: string): Workout | undefined {
  return WORKOUTS.find((w) => w.id === id);
}

export function getFeaturedWorkout(): Workout {
  const today = new Date().getDay();
  return WORKOUTS[today % WORKOUTS.length]!;
}
