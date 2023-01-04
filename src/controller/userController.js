import { restart } from "nodemon";
import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import e from "express";

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "This username doesn't exist.",
    });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  console.log("LOG USER IN! COMING SOON!🤪");
  return res.redirect("/");
  //check if password correct
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { email, name, username, location },
    file,
  } = req;
  console.log(file);
  if (
    req.session.user.username !== username &&
    req.session.user.email === email
  ) {
    const exists = await User.exists({ username: username });
    if (exists) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This username is already used",
      });
    }
  }
  if (
    req.session.user.username === username &&
    req.session.user.email !== email
  ) {
    const exists = await User.exists({ email: email });
    if (exists) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This email is already used",
      });
    }
  }
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? `/${file.path}` : avatarUrl, //file.path -> uploading file     avatarUrl -> previous uploading file
      email,
      name,
      username,
      location,
    },
    { new: true } // default is giving not updated user
  );
  req.session.user = updateUser;
  /**req.session.user = {
    ...req.session.user,
    email,
    name,
    username,
    location,
  };*/
  return res.redirect("/users/edit");
};

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { email, name, username, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({
    $or: [{ username: req.body.username }, { email: req.body.email }], // Mongoose $or operator
  });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already used by someone.",
    });
  }
  try {
    await User.create({
      email,
      name,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

/**OAuth authentification */
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      //set notification
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatarUrl,
        email: emailObj.email,
        name: userData.name,
        username: userData.login,
        socialOnly: true, //create with Github
        password: "",
        location: userData.location,
      });
    }
    //Login Process
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.user = null;
  res.locals.loggedInUser = req.session.user;
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye"); // req.flash(type, message);
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password!"); // req.flash(type, message);
    return res.redirect("/");
  }
  return res.render("change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!passwordMatch) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "The new password does not match the confirmation",
    });
  }
  user.password = newPassword;
  await user.save();
  //send notification
  req.flash("info", "Password updated"); // req.flash(type, message);
  return res.redirect("/users/edit");
};

export const myProfile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    //double populate
    path: "videos", //first populate
    populate: {
      //second populate
      path: "owner", //video's owner!
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("profile", {
    pageTitle: user.name,
    user,
  });
};
