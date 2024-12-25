import React, { useContext, useEffect, useState } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router'
import { db } from '../../config/firebase'
import { collection, arrayUnion, doc, setDoc, updateDoc, getDocs, query, serverTimestamp, where, getDoc } from 'firebase/firestore'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'


const LeftSideBar = () => {
  const navigate = useNavigate()
  const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext)
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false)

  const inputHandler = async (e) => {

    //  console.log(chatData)
    try {

      const input = e.target.value;
      if (input) {
        setShowSearch(true)
        const userRef = collection(db, 'users');
        //-------------where()?--------------
        const q = query(userRef, where("username", "==", input.toLowerCase()))
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false
          chatData.map((user) => {


            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true
            }
          })
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        }
        else {
          setUser(null)
        }
      }
      else {
        setShowSearch(false)
      }

    }
    catch (error) { }

  }
  const addChat = async () => {
    const messagesRef = collection(db, "messages")
    const chatsRef = collection(db, "chats")
    // console.log(chatData)
    try {
      const newMessageRef = doc(messagesRef)
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: []
      })
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      })
      await updateDoc(doc(chatsRef, userData.id), {
        //arrayunion
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      })

      const uSnap = await getDoc(doc(db, "users", user.id))
      const uData = uSnap.data()
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData
      })
      setShowSearch(false)
      setChatVisible(true)


    }
    catch (error) {
      toast.error(error.message)
      console.error(error)
    }
  }
  const setChat = async (item) => {
    try {

      setMessagesId(item.messageId)
      setChatUser(item)
      const userChatsRef = doc(db, 'chats', userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();
      const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === item.messageId);
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData
      });
      setChatVisible(true)
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, 'users', chatUser.userData.id);
        const userSnap = await getDoc(userRef)
        const userData = userSnap.data()
        setChatUser(prev => ({
          ...prev,
          userData: userData
        }))
      }
    }
    updateChatUserData()
  }, [chatData])
  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className='ls-top'>
        <div className="ls-nav">
          <img src={assets.logo} className='logo' alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate('/profile')}>Edit profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search Here..' />
        </div>
      </div>
      <div className="ls-list">

        {showSearch && user ?
          <div onClick={addChat} className='friends add-user'>
            <img src={assets.avatar_icon} alt="" />
            <p>{user.name}</p>
          </div>
          /** Array(12).fill("").map(...) */
          : chatData.map((item, index) => (
            <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? " " : "border"}`}>
              {/**..check console...print chatData */}
              {console.log(user)}
              <img src={assets.avatar_icon} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))}

      </div>
    </div>
  )
}

export default LeftSideBar