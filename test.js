// import fs from "fs";
// import path from "path";

// const form = new FormData();
// form.append("email", "tunwit2458@gmail.com");
// form.append("nisitId", "6710405389");
// form.append("firstName", "Tunwit");
// form.append("lastName", "Test");
// form.append("nickName", "Tun");
// form.append("bio", "Hello CNC");
// form.append("typeOfDpm", "NORMAL");

// // IMPORTANT: NUMBER
// form.append("nisitYearParticipated", "84");

// form.append("gradeGPAX", "3.56");

// // LOAD FILES FROM DISK
// form.append("profileImageFile", Bun.file("Screenshot 2025-03-08 203523.png"));
// form.append("transcriptFile", Bun.file("Screenshot 2025-03-08 203523.png"));

// form.append("address", "Bangkok");
// form.append("mbti", "INTJ");
// form.append("phoneNumber", "0812345678");
// form.append("socialContact", "LINE: tunwit");
// form.append("github", "https://github.com/example");
// form.append("interviewSlotId", "");
// form.append("referralSource", "SENIOR");
// form.append("projectExperience", "Web app");
// form.append("clubs", "Coding Club");
// form.append("interests", "Backend");
// form.append("hobbies", "Coding");
// form.append("whyCnc", "Want to learn");
// form.append("expected", "Experience");
// form.append("tools", "Node, Bun");

// const res = await fetch("http://localhost:3000/candidates/submit", {
//   method: "POST",
//   body: form,
// });
// console.log(res);

// console.log(await res.json());



import fs from "fs";
import path from "path";

const form = new FormData();

// LOAD FILES FROM DISK
form.append("profileImageFile", Bun.file("Screenshot 2025-03-08 203523.png"));
form.append("transcriptFile", Bun.file("Screenshot 2025-03-08 203523.png"));


const res = await fetch("http://localhost:3000/candidates/696df2459c978ee398e3fac2", {
  method: "PUT",
  body: form,
});
console.log(res);

console.log(await res.json());
