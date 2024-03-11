import axios from 'axios';
import Cookies from 'js-cookie';
import styles from "./Twofa.module.css"
import loginStyle from "../LoginPage/Login.module.css"
import { useEffect, useRef, useState } from 'react';
import { Navigate, redirect } from 'react-router-dom';

function Twofa(){
    const input = useRef('')
    const [red, setRed] = useState(false)
    let cookie: any
    useEffect(() => {
        cookie = Cookies.get('jwt')
    }, [])

    const checkToken = async () => {
        try {
            console.log('heeeerererere')
            const res = await axios.post(`http://${import.meta.env.VITE_DOMAIN}:8000/api/2fa/authenticate`, {token: input.current}, {
                headers: {
                    Authorization: `bearer ${cookie}`
                }
            })
            Cookies.set('jwt', res.data.jwtToken)
            setRed(() => true)
            console.log('soo good', res.data)
        }
        catch (err) {
            console.log('not good', err)
        }
    }
    return (
        <div className={loginStyle.loginBox}>
            <div className={styles.fo}>
                {red && <Navigate to="/"/>}
                <h2> Please enter 2FA code </h2>
                <div className={styles.codeInput}>
                <input placeholder="" type="text" maxLength={6} onChange={e => input.current = e.target.value}/>
                </div>
                <button className={styles.Pass_verify} onClick={checkToken}>Verify</button>
            </div>
        </div>
    );
}

export default Twofa