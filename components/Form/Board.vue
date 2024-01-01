<template>
  <UForm :state="formState" :schema="BoardSchema" class="p-4" @submit="handleSubmit">
    <UFormGroup class="mb-4" name="name" label="Board Name">
      <UInput v-model="formState.name" type="text" placeholder="Board name" />
    </UFormGroup>

    <UFormGroup class="mb-4" name="coverImage" label="Select cover image">
      <ImagePicker v-model="formState.coverImage" />
    </UFormGroup>

    <UButton type="submit" color="primary" block :loading="isLoading">
      {{ type === "create" ? "Create board" : "Update board" }}
    </UButton>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import type { z } from "zod";
import BoardSchema from "~/schemas/Board.schema";
import type { BoardDocument } from "~/server/models/Board";

interface Props {
  type: "create" | "update";
  initialData?: Partial<BoardDocument>;
  onUpdate?: (data?: any) => void;
  onCreate?: (data?: any) => void;
}

const Props = withDefaults(defineProps<Props>(), {
  type: "create",
});

const isLoading = ref(false);

const formState = reactive<Partial<BoardDocument>>({
  name: undefined,
  coverImage: undefined,
});

async function handleSubmit(event: FormSubmitEvent<z.output<typeof BoardSchema>>) {
  try {
    isLoading.value = true;
    if (Props.type === "update" && Props.initialData?._id) {
      const updatedBoard = await useFetch(`/api/boards/${Props.initialData._id}`, {
        method: "PUT",
        body: event.data,
        watch: false,
      });
      Props.onUpdate?.(updatedBoard);
      return;
    }

    const { data, error } = await useFetch("/api/boards", {
      method: "POST",
      body: event.data,
      watch: false,
    });

    if (error.value) {
      if (error.value.statusCode === 403) {
        useSubscription().showSubscriptionModal({
          title: "Multiple boards is a Premium Feature",
          description: "You can create only one board in free plan. Please upgrade to premium to create more boards",
        });
      }
    }

    Props.onCreate?.(data);
  } catch (e) {
    isLoading.value = false;
  }
}

watchEffect(() => {
  if (Props.type === "update" && Props.initialData) {
    formState.name = Props.initialData.name;
    formState.coverImage = Props.initialData.coverImage;
  }

  if (Props.type === "create") {
    formState.name = undefined;
    formState.coverImage = undefined;
  }
});
</script>
