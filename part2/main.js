const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");

//path for json file
const usersDataPath = path.resolve("./users.json");

//red json file function
const makeResANDUpdateFile = async (operation, res, inputData = undefined) => {
  try {
    let usersData = await fs.readFile(usersDataPath, { encoding: "utf-8" });
    if (!usersData) usersData = "[]";
    let formatedUserData = JSON.parse(usersData);
    operation(res, formatedUserData, inputData);
  } catch (e) {
    console.error(e);
  }
};

//write in json file function
const writeFile = async (data) => {
  try {
    await fs.writeFile(usersDataPath, data, { encoding: "utf-8" });
  } catch (e) {
    console.error(e);
  }
};

//handle res
const resHandled = (res, code, content) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.write(JSON.stringify(content));
  res.end();
};

//1. Create an API that adds a new user to your users stored in a JSON file. (ensure that the email of the new user doesn’t exist before)
const addUser = (res, data, inputData = undefined) => {
  const { name, age, email } = inputData;

  inputData = { id: Date.now(), ...inputData };

  if (!name || !age || !email) {
    resHandled(res, 400, { message: "Data format isn't right." });
    return;
  }
  const checkisUserFound = data.find((el) => el?.email === email);

  if (checkisUserFound) {
    resHandled(res, 401, { message: "Email already exists." });
    return;
  }

  data.push(inputData);

  writeFile(JSON.stringify(data));

  resHandled(res, 200, { message: "User added successfully." });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//2. Create an API that updates an existing user's name, age, or email by their ID. The user ID should be retrieved from the URL
const editUser = (res, data, inputData) => {
  const { id, updatedData } = inputData;

  const dataToChangeName = Object.entries(updatedData)[0][0];
  const dataToChangeValue = Object.entries(updatedData)[0][1];

  if (!id || !updatedData || Object.entries(updatedData).length > 1) {
    resHandled(res, 400, { message: "Data format isn't right." });
    return;
  }
  const userExist = data.find((el) => el?.id === id);

  if (!userExist) {
    resHandled(res, 404, { message: "user ID not found." });
    return;
  }

  const userEdited =
    dataToChangeName === "email"
      ? { ...userExist, email: dataToChangeValue }
      : dataToChangeName === "age"
      ? { ...userExist, age: dataToChangeValue }
      : { ...userExist, name: dataToChangeValue };

  data = data.map((el) => (el.id === id ? userEdited : el));

  writeFile(JSON.stringify(data));

  resHandled(res, 200, { message: "user data updated successfully." });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//3. Create an API that deletes a User by ID. The user id should be retrieved from the URL
const deleteUser = (res, data, inputData) => {
  const userExist = data.find((el) => el.id === inputData);
  if (!userExist) {
    resHandled(res, 404, { message: "User ID not found." });
    return;
  }

  data = data.filter((el) => el.id !== inputData);

  writeFile(JSON.stringify(data));

  resHandled(res, 200, { message: "User deleted successfully." });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//4. Create an API that gets all users from the JSON file.
const getAllUsers = (res, data, inputData = undefined) => {
  if (data.length === 0) {
    resHandled(res, 404, { message: "No Users are in the system" });
    return;
  }

  resHandled(res, 200, data);
};

//5.  Create an API that gets User by ID.
const getUser = (res, data, inputData) => {
  const user = data.find((el) => el.id === inputData);
  if (!user) {
    resHandled(res, 404, { message: "User ID not found." });
    return;
  }

  resHandled(res, 200, user);
};
//create server
let port = 3000;
const server = http.createServer((req, res) => {
  let body = "";
  const { url, method } = req;

  let id = url.split("/").length > 1 ? url.split("/")[2] : null;

  switch (url) {
    case "/":
      if (method === "GET") resHandled(res, 200, { message: "Assignment3" });
      break;
    case "/user":
      //Task 1
      if (method === "POST") {
        req.on("data", (chunks) => {
          body += chunks;
        });

        req.on("end", () => {
          makeResANDUpdateFile(addUser, res, JSON.parse(body));
        });
        //Task 4
      } else if (method === "GET") {
        makeResANDUpdateFile(getAllUsers, res);
      } else {
        resHandled(res, 401, { message: "Wrong Request" });
      }
      break;
    case `/user/${id}`:
      //Task 2
      if (method === "PATCH") {
        req.on("data", (chunks) => {
          body += chunks;
        });

        req.on("end", () => {
          makeResANDUpdateFile(editUser, res, {
            id: +id,
            updatedData: JSON.parse(body),
          });
        });
        //Task 3
      } else if (method === "DELETE") {
        makeResANDUpdateFile(deleteUser, res, +id);
        //Task 5
      } else if (method === "GET") {
        makeResANDUpdateFile(getUser, res, +id);
      } else {
        resHandled(res, 401, { message: "Wrong Request" });
      }
      break;
    default:
      resHandled(res, 404, { message: "Wrong Request" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Server is opened on port ${port}`);
});

server.on("error", (error) => {
  if (error) return console.log(error);
  port++;
  server.listen(port, "127.0.0.1", () => {
    console.log(`Server is opened on port ${port}`);
  });
});
