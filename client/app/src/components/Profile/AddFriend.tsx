import styles from "./AddFriend.module.css"
const backend = `http://${import.meta.env.VITE_DOMAIN}:8000/api`
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

function AddFriend({prop}: {prop: string}){
    const [status, setStatus] = useState(0)
    // const [image, setImage] = useState('')
    useEffect(() => {
      const fetcher = async () => {
        try {
            const res = await axios(`${backend}/user/getFriendStatus?friendId=${prop}`, {
              headers: {
                Authorization: `bearer ${Cookies.get('jwt')}`
              }
            })
            console.log(res.data)
            setStatus(res.data.status)
          }
          catch (err) {
            console.error(prop)
          }
      }
      fetcher()
    }, [])

    const addFriend = async () => {
      try {
        await axios(`${backend}/user/add_friend?friendId=${prop}`, {
          headers: {
            Authorization: `bearer ${Cookies.get('jwt')}`
          }
        })
      }
      catch (err) {
        console.error(prop)
      }
    }

    const acceptFriend = async () => {
      try {
        await axios(`${backend}/user/accept_friend?friendId=${prop}`, {
          headers: {
            Authorization: `bearer ${Cookies.get('jwt')}`
          }
        })
      }
      catch (err) {
        console.error(prop)
      }
    }

    const RemoveFriend = async () => {
      try {
        await axios(`${backend}/user/remove_friend?friendId=${prop}`, {
          headers: {
            Authorization: `bearer ${Cookies.get('jwt')}`
          }
        })
      }
      catch (err) {
        console.error(prop)
      }
    }

    const handleFriendship = () => {
      if (status != 1)
        status == 0 ? addFriend() : status == 2 ? acceptFriend() : RemoveFriend(); 
    }

    return <div>
        <button className={styles.PlayButton} onClick={handleFriendship}> {status == 0 ? "Add Friend" : status == 1 ? "Pending" : status == 2 ? "Accept As Friend" : "Destroy Friendship"} </button>
    </div>
}

export default AddFriend