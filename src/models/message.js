import mongoose from "mongoose";
const userSchema = mongoose.Schema({
  clientSessionId: {
    type: String,
  },
  message: {
    type: String,
  },
  viewedByAdmin: {
    type: Boolean,
  },
  viewedByUser: {
    type: Boolean,
  },
  createdAt: {
    type: Number,
  },
  sentByAdmin: {
    type: Boolean,
  },
  userName: {
    type: String,
  },
  clientEmail: {
    type: String,
  },
  clientPhoneNumber: {
    type: String,
  },
});

const messageModel = mongoose.model("Message", userSchema);
export default messageModel;
