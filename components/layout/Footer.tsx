export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="font-bold text-lg mb-1" style={{ fontFamily: "var(--font-serif)" }}>
              유한공업고등학교 총동문회
            </p>
            <p className="text-sm text-primary-foreground/70">
              유일한 박사의 숭고한 정신을 이어받아 동문 간의 유대와 발전을 도모합니다.
            </p>
          </div>
          <div className="text-sm text-primary-foreground/60 flex flex-col gap-1 md:text-right">
            <p>유한공업고등학교 총동문회</p>
            <p>© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
