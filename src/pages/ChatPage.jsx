import SupportiveChat from '../components/SupportiveChat';

export default function ChatPage() {
  return (
    <div className="flex-center" style={{ width: '100%', height: '100%' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <SupportiveChat />
      </div>
    </div>
  );
}
