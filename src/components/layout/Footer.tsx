export function Footer() {
  return (
    <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
      <p>VibeShare — 分享 Vibecoding 创造的每一份灵感</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} VibeShare. Built with AI.</p>
    </footer>
  );
}
