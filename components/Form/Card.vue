<template>
  <UForm :state="formState" :schema="CardSchema" @submit="handleSubmit">
    <UFormGroup class="mb-4" name="title" label="Title">
      <UInput type="text" v-model="formState.title" autofocus />
    </UFormGroup>

    <UFormGroup class="mb-4" name="description" label="Description">
      <ClientOnly>
        <QuillEditor v-model:content="formState.description" them="snow" toolbar="minimal" content-type="html" />
      </ClientOnly>
    </UFormGroup>

    <div class="flex gap-4 mt-4 justify-end">
      <UButton
        v-if="type === 'update'"
        type="button"
        :loading="isLoading"
        color="red"
        variant="soft"
        icon="i-heroicons-trash"
        @click="handleDelete"
      ></UButton>
      <UButton type="submit" :loading="isLoading" :block="type === 'create'">
        {{ type === "create" ? "Create card" : "Update card" }}
      </UButton>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { z } from "zod";
import CardSchema from "~/schemas/Card.schema";
import type { CardDocument } from "~/server/models/Card";

interface Props {
  type: "create" | "update";
  listId: string;
  initialData?: Partial<CardDocument>;
  onCreate?: () => void;
  onUpdate?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  type: "create",
});

const PartialCardSchema = CardSchema.partial();

const isLoading = ref(false);

const { destroy, update } = useCard();

const formState = reactive<z.infer<typeof PartialCardSchema>>({
  title: undefined,
  description: undefined,
  list: props.listId,
});

async function handleSubmit(event: FormSubmitEvent<z.output<typeof CardSchema>>) {
  try {
    isLoading.value = true;

    if (props.type === "update" && props.initialData) {
      // await useFetch(`/api/lists/${props.listId}/cards/${props.initialData._id}`, {
      //   method: "PUT",
      //   body: JSON.stringify(event.data),
      //   watch: false,
      // });

      update(props.listId, props.initialData._id, event.data);

      props.onUpdate?.();
      return;
    }

    await useFetch(`/api/lists/${props.listId}/cards`, {
      method: "POST",
      body: JSON.stringify(event.data),
      watch: false,
    });

    props.onCreate?.();
  } catch (error: any) {
    useToast().add({
      title: "Error",
      description: error.message || "Somthing went wrong",
    });
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete() {
  try {
    isLoading.value = true;

    // await useFetch(`/api/lists/${props.listId}/cards/${props.initialData?._id}`, {
    //   method: "DELETE",
    //   watch: false,
    // });

    destroy(props.listId, props.initialData?._id, props.onUpdate);

    // props.onUpdate?.();
  } catch (error: any) {
    // useToast().add({
    //   title: "Error",
    //   description: error.message || "Somthing went wrong",
    // });
  } finally {
    isLoading.value = false;
  }
}

watchEffect(() => {
  if (props.type === "update" && props.initialData) {
    formState.title = props.initialData.title;
    formState.description = props.initialData.description;
  }

  if (props.type === "create") {
    formState.title = undefined;
    formState.description = undefined;
  }
});
</script>

<style>
.ql-container {
  @apply h-32 rounded-b-lg shadow;
}
.ql-toolbar {
  @apply rounded-t-lg;
}
</style>
