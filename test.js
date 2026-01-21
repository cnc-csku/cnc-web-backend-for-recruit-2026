import fs from "fs";
import path from "path";

const myHeaders = new Headers();
myHeaders.append(
  "Authorization",
  "bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..N1TxT5PbusXnVF4v._ABypFHmJF68FQFHqL6gZU5OG2IqGX3d0kjFkqC1sporaBWJJ3wKtNkV8Ai7ZTYRtmh41hgUC6uYV5ao-Tg1wBI5KiiCO8a-F7Yv00ygmbB2648g_GlsQw41lO003-pUP79WTe5tgFpBadSWxbj1JAlUXLriuJNJ10vgjX9KfervaT49cvsPypeXLOjZLO0poZK06hS2g7Io89txH9Db4C12WUgFy8v0W-GFsqxctCeLD9oFkfd_SDyBf6ej0DDGP6bwuDvidDXG9It1x0-w0Iy3I6uGmcsbtTJSETfmR_how6m_2srfI9SzPC42XnsEHtF0qIMcGikDJzYoV-JztYLzmqDy3aJthyghtEKTok2Y8w9ajntCNS2ImZ6sDxI_CuswlUYa22HiU9FIMuU8UoyHzfvqj-REvhbsr0Cq-2R6oAjuAmbGKG8alw4dEOIv2n9XLCxTfx9FBfMvnUUJyRUbePHhznYaVingmBQV7NJzKiT_rPsU0-QJBQ8zCLx63vTcWWmqS71LQmQ86a-jm2ru0mCDNeTHuL2nArusQsBvJPvpIbi8VCbg-5bEkBJmJTYcsNJyVWDAh8ANNvoTGPuhdnsnxzsAXuonAWeu8HouAayH6yGDkDurTMiHGpuZPuxCVwzSXUmz6kzftZFSBZNeKHyMCZJIjIxX1nNXX0fHXiKN8Soru5yayAwPa8dRcwadTE5_z8dDDfv4JiNoVLP7h6E8D7Dk-V1rXrfgi890B2FRedcNi8PHcSEEqm0twhdPyQXhxHahEJSCs9s3bG7-1ch_f0cGtF-7Z3ngLvi0lv9BoI9yn5XHb50QleoT2VNiXT7ZvG3YpMAC7CP9k98.tWDtfAWZoeuvJfMeUyM3iw",
);

const formdata = new FormData();
formdata.append("nisitId", "6710405389");
formdata.append("firstName", "John");
formdata.append("lastName", "Doe");
formdata.append("nickName", "Johnny");
formdata.append(
  "bio",
  "A computer science student passionate about coding and robotics.",
);
formdata.append("typeOfDpm", "NORMAL");
formdata.append("nisitYearParticipated", "84");
formdata.append("gradeGPAX", "3.45");
formdata.append("address", "123 Main St, Bangkok, Thailand");
formdata.append("mbti", "INTJ");
formdata.append("phoneNumber", "0812345678");
formdata.append("socialContact", "@johnny_social");
formdata.append("github", "https://github.com/johnnydoe");
formdata.append("referralSource", "FRIEND");
formdata.append(
  "projectExperience",
  "Developed a web app for managing school events.",
);
formdata.append("clubs", "Robotics Club, Coding Club");
formdata.append("interests", "AI, Web Development, Open Source");
formdata.append("hobbies", "Reading, Gaming, Hiking");
formdata.append(
  "whyCnc",
  "I want to contribute to innovative projects and improve my coding skills.",
);
formdata.append(
  "expected",
  "To gain experience and work with a motivated team.",
);
formdata.append("tools", "Node.js, React, Python, MongoDB");
const profile = "jump.jpg";

formdata.append("profileImage", new Blob([fs.readFileSync(profile)]), profile);

const trans = "Screenshot 2569-01-19 at 21.34.04.png";
formdata.append("transcript", new Blob([fs.readFileSync(trans)]), trans);

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: formdata,
  redirect: "follow",
};

fetch("http://localhost:3000/candidates/submit", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
