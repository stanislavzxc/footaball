import { Layout } from "../components/Layout";
import { TelegramButton } from "../components/TelegramButton";
import PlayerStats from "../pages/PlayerStats";
export default function MyProfile() {
  return (
    <Layout  showBackButton>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          alignItems: "center",
          paddingTop: "20px",
        }}
      >
        <PlayerStats/>


        <div style={{ marginTop: "20px" }}>
          <TelegramButton to="/" variant="secondary">
            Назад на главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}
