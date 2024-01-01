<template>
  <WrapperAuth title="Sign In to your account">
    <template #header>
      <span class="text-sm mr-px"> Don't have an account? </span>
      <NuxtLink to="/auth/signup" class="text-primary-500"> Sign Up </NuxtLink>
    </template>

    <UForm :state="formState" :schema="SigninSchema" @submit="handleSignin">
      <UFormGroup class="mb-4" name="email" label="Email">
        <UInput v-model="formState.email" type="email" placeholder="john@email.com" />
      </UFormGroup>
      <UFormGroup class="mb-4" name="password" label="Password">
        <UInput v-model="formState.password" type="password" placeholder="********" />
      </UFormGroup>
      <UFormGroup>
        <UButton :loading="isLoading" type="submit" color="primary" block> Sign In </UButton>
      </UFormGroup>
    </UForm>
  </WrapperAuth>
</template>

<script setup lang="ts">
// import { useSignin } from "~/composables/useSignin";
// useHead({
//   title: "Signin",
// });
// const { formState, isLoading, validationSchema, handleSubmit } = useSignin();

import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { z } from "zod";
import SigninSchema from "~/schemas/Signin.schema";

useHead({
  title: "Signin",
});

const formState = reactive({
  email: undefined,
  password: undefined,
});

const isLoading = ref(false);

const router = useRouter();
const { signIn } = useAuth();

async function handleSignin(event: FormSubmitEvent<z.output<typeof SigninSchema>>) {
  try {
    isLoading.value = true;

    const res = await signIn("credentials", {
      redirect: false,
      email: event.data.email,
      password: event.data.password,
    });

    if (res.error) {
      throw new Error(error);
    }

    router.push("/");
  } catch (e) {
    useToast().add({
      id: "error",
      title: "Invalid credentials",
      color: "red",
      icon: "i-heroicons-information-circle",
      timeout: 3000,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped></style>
