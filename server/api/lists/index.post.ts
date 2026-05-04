import { validateSchema } from "~/utils/validate";
import ListSchema from "~/schemas/List.schema";
import { Board } from "~/server/models/Board";
import { List } from "~/server/models/List";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  validateSchema(ListSchema, body);

  const user = event.context.user;

  const list = await List.create({
    ...body,
    owner: user._id,
  });

  if (!list) {
    throw createError({
      statusCode: 400,
      message: "Something went wrong",
    });
  }

  await Board.findOneAndUpdate(
    {
      _id: body.board,
      owner: user._id,
    },
    {
      $push: { lists: list._id },
    },
    { new: true }
  );

  return list;
});
