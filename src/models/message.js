import mongoose from "mongoose";
const userSchema = mongoose.Schema({
  clientSocketId: {
    type: String,
  },
  //Mongo id
  adminId: {
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
});

const messageModel = mongoose.model("Message", userSchema);
export default messageModel;
