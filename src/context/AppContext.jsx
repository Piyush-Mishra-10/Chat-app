import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useRef, useState } from "react";
import { db, auth } from "../config/firebase";// added auth here
import { useNavigate } from "react-router-dom";


export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState([]);
    const [messagesId, setMessagesId] = useState(null)
    const [messages, setMessages] = useState([])
    const [chatUser, setChatUser] = useState(null)
    const [chatVisible, setChatVisible] = useState(false)

    /* 
    error:
      uncaught TypeError: Cannot read properties of null (reading 'map')
     at LeftSideBar (LeftSideBar.jsx:120:22)
    ----------------------------------------------------
    ----------------------------------------------------
     solution:
    1. changed  const [chatData, setChatData] = useState(null);
       into
       const [chatData, setChatData] = useState([]);
 2.
 Even though chatData is defined in the AppContext provider, useContext(AppContext) might be returning null value of chatData...

  hume leftsidebar mai line number 116 mai array(21).fill("").map() ki jagah chatData.map() krrhe tbhi ye error arha tha kyunki tb  appcontextprovider null value derha tha chatData ki ..

  chatData.map() esliye likh rhe the ..jisse jitne bhi user h database mai  unke naam leftsidebar m show ho.chatData mai saare user k last seen , name,  last message etc ye sb store hai...

  3.
   Error in chatData.map when chatData is null or undefined
If chatData is not an array or is undefined, calling .map() will throw a runtime error.
Fix: Ensure chatData is initialized as an array or handle it conditionally...

humne chatData ki value null likhi thi... jbki use as an array likhna tha []
map() function m array  use krte h otherwise it will through an error....
       
    
    */
    const loadUserData = async (uid) => {

        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);
            //-------------------changed from if(userData.avatar && userdata.name) to if( userData.name) 
            //isse sirf name dekhega ki type kiya h ki nhi ..profile picture nhi dekhege wo optional hojayega
            if (userData.name) {

                navigate('/chat')
            }
            else {

                navigate('/profile')
            }

            await updateDoc(userRef, {
                lastSeen: Date.now()
            })
            //----------------------changed here---------------------
            setInterval(async () => {
                if (auth.chatUser) {
                    await updateDoc(useRef, {
                        lastSeen: Date.now()
                    })
                }
            }, 60000)

        } catch (error) {

        }
    }
 
    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                const chatItems = res.data().chatsData;

                const tempData = [];
                for (const item of chatItems) {
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempData.push({ ...item, userData })
                }
                //------------------updatedAt??------------------
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt))

            })
            return () => {
                unSub();
            }
        }
    }, [userData])
    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData, messages, setMessages, messagesId, setMessagesId, chatUser, setChatUser, chatVisible, setChatVisible
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider