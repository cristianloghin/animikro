import { useAnimikro } from "../lib/main";
import { boxAnimation, contentAnimation } from "./animations";

export function Other() {
  const [Box] = useAnimikro(boxAnimation, {
    onFinished: () => contentController.start(),
  });
  const [Content, contentController] = useAnimikro(contentAnimation, {
    autoPlay: false,
  });

  return (
    <>
      <h1>Animikro</h1>
      <Box style={{ padding: 30, backgroundColor: "navy" }}>
        <Content>Some content in box</Content>
      </Box>
    </>
  );
}
