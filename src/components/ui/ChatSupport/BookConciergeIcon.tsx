// ChatSupport 本アイコン（コンシェルジュ）

const BookConciergeIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <path
      d='M12 6.25C10.5 4.75 7.75 3.75 5 3.75c-1 0-1.75.12-2 .18v14.14c.25-.06 1-.18 2-.18 2.75 0 5.5 1 7 2.5'
      strokeWidth={1.65}
    />
    <path
      d='M12 6.25c1.5-1.5 4.25-2.5 7-2.5 1 0 1.75.12 2 .18v14.14c-.25-.06-1-.18-2-.18-2.75 0-5.5 1-7 2.5'
      strokeWidth={1.65}
    />
    <path d='M12 6.25v14.14' strokeWidth={1.65} />
  </svg>
)

export default BookConciergeIcon
