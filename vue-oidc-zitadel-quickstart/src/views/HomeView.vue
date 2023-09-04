<template>
  <div class="home">
    <div class="home">
      <p v-if="isLoggedIn">User: {{ currentUser }}</p>
      <button class="btn" @click="login" v-if="!isLoggedIn">Login</button>
      <button class="btn" @click="logout" v-if="isLoggedIn">Logout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AuthService from '@/services/auth.service'

const auth = new AuthService()

let currentUser: string = ''
let accessTokenExpired: boolean | undefined = false
let isLoggedIn: boolean = false

onMounted(() => {
  auth.getUser().then((user: any) => {
    if (user) {
      currentUser = user.profile.name
      accessTokenExpired = user.expired
      isLoggedIn = user !== null && !user.expired
      console.debug(
        `Got currentUser=${currentUser} accessTokenExpired=${accessTokenExpired} isLoggedIn=${isLoggedIn}`
      )
    } else {
      console.debug(`No user found.`)
    }
  })
})

const login = () => auth.login()
const logout = () => auth.logout()
</script>

<style>
.btn {
  color: #42b983;
  font-weight: bold;
  background-color: #007bff;
  border-color: #007bff;
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: transparent;
  border: 1px solid #42b983;
  padding: 0.375rem 0.75rem;
  margin: 10px;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}
</style>
