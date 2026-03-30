import asyncHandler from "../../utils/asyncHandler.js";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const user = await registerUser({ name, email, password, role });

    res.status(201).json({
        success: true,
        message: "user Registered Successfully",
        data: user,

    })
})


//login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await loginUser({ email, password });

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: { accessToken, refreshToken, user }
    });
});
//refresh token
export const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: " Refresh Token is required"
        })

    }
    const { accessToken } = await refreshAccessToken(refreshToken);
    res.status(200).json({
        success: true,
        message: "Access Token refreshed",
        data: { accessToken },
    })
})

//logout 
export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: "Refresh token is required"
        })
    }
    const result = await logoutUser(refreshToken);
    res.status(200).json({
        success: true,
        message: result.message

    })
})
