<template>
  <section>
    <h1>Login</h1>
    <div v-if="!isLoggedIn">
      You haven't logged in. Click
      <button @click="handleLoginClick">here</button> to login.
    </div>
    <div v-else>
      <div>
        <h2>State</h2>
        <p>You're now logged in as {{ JSON.stringify({ id, name }) }}.</p>
      </div>
      <div>
        <h2>Getters</h2>
        <p>Uppercase-name: {{ upperCaseName }} (getters)</p>
      </div>
      <form @submit.prevent="handleFormSubmit">
        <h2>Mutations</h2>
        <label for="name">Name: </label>
        <input id="name" v-model="customName" />
        <button type="submit">Update name</button>
      </form>
      <div style="margin-top: 2rem; max-width: 300px">
        Click <button @click="id++">here</button> to increment id (id++).
        <div style="margin-top: 0.25rem">
          You will see a warning in console because the flattened state is readonly. Only
          mutations are allowed to mutate state.
        </div>
      </div>
      <button @click="logout" style="display: block; margin-top: 2rem">Logout</button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { webModule } from '../modules/web'

const { user } = webModule
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

// Demonstrate the updateName function
const customName = ref(name.value)

watch(name, (value) => (customName.value = value))

const handleFormSubmit = () => {
  updateName(customName.value)
}
</script>
