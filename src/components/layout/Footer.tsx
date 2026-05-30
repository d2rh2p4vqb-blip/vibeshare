export function Footer() {
  const icpNumber = process.env.NEXT_PUBLIC_ICP_NUMBER;

  return (
    <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
      <p>VibeShare — 分享 Vibecoding 创造的每一份灵感</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} VibeShare. Built with AI.</p>
      {icpNumber && (
        <p className="mt-2">
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {icpNumber}
          </a>
        </p>
      )}
    </footer>
  );
}
