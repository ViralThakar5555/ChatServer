const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

app.use(express.json({ limit: "20mb" }));

const cors = require("cors");

const multer = require("multer");

const PORT=8080;

//app.use("/static", express.static(path.join(__dirname, "uploads")));
//app.use("/static", express.static(path.join(__dirname,"public" ,"uploads")));

app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use(cors());
// Creating a http server using express
const server = http.createServer(app);

// the io variable can be used to do all the necessary things regarding Socket
const io = new Server(server, {
  cors: {
    //  origin: "http://127.0.0.1:5173",
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});
const upload = multer({ storage: storage });

app.post("/uploadimage", upload.single("imagefile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  console.log("file Uploaded Successfully");
//  res.send("File uploaded successfully!");
  const imageUrl =`http://192.168.29.92:${PORT}/images/${req.file.filename}`;
  
  console.log("ImageUrl is ",imageUrl);

  res
    .status(200)
    .json({
      result: "Image Uploaded Successfully",
      file_info: req.file,
      image_url: imageUrl,
    });
});
// defining the io function to listen to the socket events

io.on("connection", (socket) => {
  console.log(`User Connected ${socket.id}`);
  // Lets create a send_message event that listens to the client whenever the
  // connected user calls the 'send_message' event allong with the data that
  // contains the message data
  socket.on("send_message", (data) => {
    io.emit("receive_message", data); // Send to all connected clients // Using socket.emit instead of io.emit. socket.emit sends the message only to the individual socket that triggered the event, while io.emit sends it to all connected clients.

    //socket.broadcast.emit('receive_message',data) // send to all connected client
    const mydata = {
      username: "Viral Thakar",
      city: "Ahmedabad",
    };
    // socket.emit("receive_message",mydata);

    //  socket.emit("receive_message", data);

    console.log(" message received from client", data);

    // const jsonData = JSON.parse(data);
    //  console.log("data is ", jsonData);
    //  console.log(" my parsed data is",jsonData.city);
    // io.to("LL1yu5B8ptkU-7WlAAAB").emit();
  });

  socket.on("send_image", (data) => {
    const jsonObject = JSON.parse(data);

    //  const base64Image = jsonObject.image;

    const base64Image1 = jsonObject.image;

    const filename1 = `image_${Date.now()}.png`;
    const imagePath = `public/images/${filename1}`;
    const base64Data = base64Image1.replace(
      /^data:image\/png[a-z]+;base64,/,
      ""
    );
    // Process or save the image

    fs.writeFile(imagePath, base64Data, "base64", (err) => {
      if (err) {
        console.error(err);
        //  return res.status(500).send('Error saving image.');
      }
      console.log("Image saved successfully", filename1);
      //  res.status(200).send({ message: 'Image saved successfully.', filename: filename });
    });
    console.log("imagedata recieved ", base64Image1);

    // To get stored images from uploads folder http://localhost:8080/images/image_1748252005379.png

    // const imageUrl = `${req.protocol}://${req.get("host")}/static/images/${filename1}`;

    const PORT = 8080;

    //const imageurl1 = `http://localhost:8080/uploads/${filename1}`;

    const imageUrl2 = `http://192.168.29.92:${PORT}/images/${filename1}`;

    console.log("Image Url is ", imageUrl2);

    const sendimageurl = { imageurl: imageUrl2 };

    if (imageUrl2 != null) {
      socket.emit("recieve_image", sendimageurl);
    }

    //console.log("Received image data",base64Image);

    // Extract image type and data
    //const matches = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);

    /*if (!matches || matches.length !== 3) {
      //  return res.status(400).json({ error: "Invalid base64 string format" });
      console.log("Invalid base64 string format");
    }

    const imageType = matches[1].split("/")[1]; // e.g., png, jpeg
    const imageBuffer = Buffer.from(matches[2], "base64");
    const filename = `image-${Date.now()}.${imageType}`;
    const filepath = path.join(__dirname, "uploads", filename);

    // Ensure uploads folder exists
    fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

    // Write image to disk
    fs.writeFile(filepath, imageBuffer, (err) => {
      if (err) {
        console.error("Error saving image:", err);
        // return res.status(500).json({ error: "Failed to save image" });
      }

      console.log("Image uploaded successfully", filename);

      // res.json({ message: "Image uploaded successfully", filename });
    });*/
  });
});

// io.socketsJoin("room1");

server.listen(8080, () => {
  console.log("ChatServer is running on port 8080");
});
