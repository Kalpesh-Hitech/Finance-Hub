import React from 'react'
import authReader from "../Context/ContextSlices/authReader"
import { configureStore } from '@reduxjs/toolkit'
export const store=configureStore({
  reducer:{
    auth:authReader,
  }
})
