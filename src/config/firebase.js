
import { createUserWithEmailAndPassword,getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {collection, doc,getDoc,getDocs,getFirestore,query,setDoc, where} from "firebase/firestore";
import { toast } from "react-toastify";

import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCU2fjoj5C9xDp1aO-EwK6Je9W4hTyXi6Q",
    authDomain: "chat-application-b4030.firebaseapp.com",
    projectId: "chat-application-b4030",
    storageBucket: "chat-application-b4030.firebasestorage.app",
    messagingSenderId: "939555850183",
    appId: "1:939555850183:web:643bd4be6341f94b547be2"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth =getAuth(app)
const db = getFirestore(app);

const signup = async(username,email,password) => {
    console.log("I am sign up page")
    try{
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, there I am using chat-app",
            lastSeen: Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    } catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

const login = async (email,password) =>{
    try{
        await signInWithEmailAndPassword(auth, email,password)
    } catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}
const logout = async() => {
    try{
        await signOut(auth)
    } catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

const resetPass=async(email)=>{
    if(!email){
        toast.error("enter your email")
        return null;
    }
    try {
        const userRef=collection(db,'users');
        const q=query(userRef,where("email","==",email))
        const querySnap=await getDocs(q)
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email)
            toast.success("Reset Email Sent")
        }
        else{
            toast.error("Email doesn't exists")
        }
    } catch (error) {
        console.error(error)
        toast.error(error.message)
    }
}

export {signup, login, logout, auth, db,resetPass}