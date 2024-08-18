// src/utils/auth.js

import { jwtDecode } from "jwt-decode";

export function getUserIdFromJwt() {
    const token = localStorage.getItem('jwt');
    if (token) {
        const decoded = jwtDecode(token);
        return decoded.user_id;  // Payload에서 user_id 추출
    }
    return null;
}
