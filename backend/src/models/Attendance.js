import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "On Leave"],
      required: true,
      default: "Present",
    },
    checkIn: Date,
    checkOut: Date,
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

const Attendance =
  mongoose.models.Attendance ||
  mongoose.models.Attendence ||
  mongoose.model("Attendance", attendanceSchema);

export default Attendance;
