export const metadata = {
  title: "Privacy Policy – Read.ipynb",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "#e2e8f0", background: "#0f1117", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#8ba8cc", marginBottom: 40 }}>Last updated: March 2026</p>

      <p>Read.ipynb ("the App") is a Jupyter Notebook viewer for Android developed by Molysystems. This page explains how the App handles your data.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 8 }}>Data Collection</h2>
      <p>The App does <strong>not</strong> collect, store, or transmit any personal data. Specifically:</p>
      <ul style={{ paddingLeft: 24, marginTop: 8 }}>
        <li>No account or sign-in is required.</li>
        <li>No analytics or tracking libraries are used.</li>
        <li>No data is sent to any server.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 8 }}>File Access</h2>
      <p>The App opens <code>.ipynb</code> files that you explicitly select on your device. These files are processed entirely on-device and are never uploaded or shared.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 8 }}>Permissions</h2>
      <p>The App requests only the permissions necessary to open files you choose. No background access to storage, camera, microphone, or location is requested.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 8 }}>Third-Party Services</h2>
      <p>The App does not integrate any third-party SDKs, advertising networks, or analytics services.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 8 }}>Changes to This Policy</h2>
      <p>If this policy changes, the updated version will be posted at this URL with a revised date.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 8 }}>Contact</h2>
      <p>For questions, please open an issue on GitHub:</p>
      <p style={{ marginTop: 4 }}>
        <a href="https://github.com/molysystems/ipynb-viewer" style={{ color: "#4d9fff" }}>
          https://github.com/molysystems/ipynb-viewer
        </a>
      </p>
    </main>
  );
}
