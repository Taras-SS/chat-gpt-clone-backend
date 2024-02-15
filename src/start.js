import { connect as dbConnect } from "./db/index.js";

const PORT = process.env.PORT || 8000;

const start = async (app) => {
  await dbConnect();
  return app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
};

export default start;
