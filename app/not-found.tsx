export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white rounded-card shadow-card p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">404</h2>
        <p className="text-gray-600 mb-6">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          홈으로 이동
        </a>
      </div>
    </div>
  )
}





