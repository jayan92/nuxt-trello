export const useList = () => {
  async function destroy(id: string, onDestroy?: () => void) {
    try {
      useToast().add({
        title: "Delete list",
        description: "Are you sure you want to delete this list?",
        actions: [
          {
            label: "Cancel",
            click: () => {},
          },
          {
            label: "Yes",
            color: "red",
            click: async () => {
              await useFetch(`/api/lists/${id}`, {
                method: "DELETE",
              });
              onDestroy?.();
            },
          },
        ],
        timeout: 5000,
        color: "red",
      });
    } catch (error: any) {
      useToast().add({
        title: "Error",
        description: error.message || "Something went wrong",
      });
    }
  }

  async function update(id: string, data: Record<string, unknown>) {
    await useFetch(`/api/lists/${id}`, {
      body: data,
      method: "PUT",
      watch: false,
    });
  }

  return {
    destroy,
    update,
  };
};
