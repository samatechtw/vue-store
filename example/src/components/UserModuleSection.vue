<template>
  <section>
    <h1>User Module</h1>
    <div v-if="!isLoggedIn">
      You haven't logged in. Click
      <button @click="handleLoginClick">here</button> to login.
    </div>
    <div v-else>
      <div>
        <p>You're now logged in.</p>
        <p>ID: {{ id }}</p>
        <p>Name: {{ name }}</p>
        <p>Uppercase-name: {{ upperCaseName }} (getters)</p>
      </div>
      <form @submit.prevent="handleFormSubmit">
        <label for="name">Name: </label>
        <input id="name" v-model="customName" />
        <button type="submit">Update name</button>
      </form>
      <div style="margin-top: 2rem; max-width: 300px">
        Click <button @click="id++">here</button> to increment id (id++).
        <div style="margin-top: 0.25rem">
          You will see a warning in console because the flattened state is
          readonly. Only mutations are allowed to mutate state.
        </div>
      </div>
      <button @click="logout" style="display: block; margin-top: 2rem">
        Logout
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { webStore } from '../stores/web-store'

const { user } = webStore.modules
const {
  // state
  id,
  name,
  // getters
  isLoggedIn,
  upperCaseName,
  // mutations
  login,
  updateName,
  logout,
} = user

const handleLoginClick = () => {
  login({
    id: 1,
    name: 'Admin',
  })
}

// these things are just here for the demonstration of updateName function
const customName = ref(name.value)

watch(name, (value) => (customName.value = value))

const handleFormSubmit = () => {
  updateName(customName.value)
}
</script>
