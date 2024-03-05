import { useEffect, useState } from "react";
import MenuBtn from "./MenuBtn";
import Cookies from "js-cookie";
import axios from "axios";

type Props = {
  isAdmin: boolean;
  isOwner: boolean;
  idClient: number;
  idChat: number;
  isGroup: boolean;
  isMuted: boolean;
  imgClicked?: () => void;
};

const MenuImg = (props: Props) => {
  const [isBlock, BlockStateChanged] = useState(false);
  const mytoken = Cookies.get("jwt");

  useEffect(() => {
    const isBlocked = async () => {
      const res = await axios.get(
        `http://${
          import.meta.env.VITE_DOMAIN
        }:8000/api/chat/isBlocked?targetId=${props.idClient}`,
        {
          headers: {
            Authorization: `bearer ${mytoken}`,
          },
        }
      );
      BlockStateChanged(() => res.data.isBlocked);
    };
    isBlocked();
  }, []);

  const BlcokUser = async (bool: boolean) => {
    await axios.post(
      `http://${import.meta.env.VITE_DOMAIN}:8000/api/chat/blockOrUnblock`,
      {
        targetId: props.idClient,
        block: bool,
      },
      {
        headers: {
          Authorization: `bearer ${mytoken}`,
        },
      }
    );
    if (bool) BlockStateChanged(true);
    else BlockStateChanged(false);
  };

  const addAdmin = async () => {
    console.log('add admin')
    await axios.post(
      `http://${import.meta.env.VITE_DOMAIN}:8000/api/chat/promote`,
      {
        targetId: props.idClient,
        chatId: props.idChat,
      },
      {
        headers: {
          Authorization: `bearer ${mytoken}`,
        },
      }
    );
    if (props.imgClicked)
      props.imgClicked();
  };

  return (
    <div style={{ margin: "5px" }}>
      {!props.isGroup && !isBlock && (
        <MenuBtn
          action={1}
          onChildClick={() => BlcokUser(true)}
          ifMute={true}
          str="Block"
        />
      )}
      {!props.isGroup && isBlock && (
        <MenuBtn
          action={1}
          onChildClick={() => BlcokUser(false)}
          ifMute={false}
          str="Unblock"
        />
      )}
      {props.isGroup && props.isOwner && (
        <MenuBtn
          onChildClick2={addAdmin}
          action={2}
          ifMute={true}
          str="add admin"
        />
      )}
      {props.isGroup && props.isAdmin && (
        <MenuBtn
          action={3}
          ifMute={true}
          str="kick out"
        />
      )}
      {props.isGroup && props.isAdmin && (
        <MenuBtn
          action={4}
          ifMute={true}
          str="Ban"
        />
      )}
    </div>
  );
};

export default MenuImg;
