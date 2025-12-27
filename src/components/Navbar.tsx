import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const Navbar = () => {
	const { isDarkMode } = useTheme()
	const location = useLocation()

	return (
		<div className='fixed left-[50%] translate-x-[-50%] bottom-0 bg-[#F3F4F8] dark:bg-[#35363A] w-full py-[9px]'>
			<div className='mx-auto px-[25px] w-[380px] flex justify-between'>
				<div className='flex flex-col items-center'>
					<Link
						to='/register'
						className={`text-center leading-[14px] flex flex-col items-center`}
					>
						{isDarkMode && location.pathname === '/register' ? (
							<img src='./logo2.png' />
						) : location.pathname === '/register' && !isDarkMode ? (
							<img src='./logo3.png' alt='' />
						) : (
							<img src='./logo.png' alt='' />
						)}

						<p
							className={`${
								location.pathname === '/register' && !isDarkMode
									? 'text-[#3D82FF]'
									: location.pathname === '/register' && isDarkMode
									? 'text-[#6fbbe5]'
									: 'text-[#697281]'
							} mt-[3px] text-[12px] font-bold`}
						>
							Записаться
							<br /> на матч
						</p>
					</Link>
				</div>
				<div className='flex flex-col items-center'>
					<Link
						to='/matches'
						className={`text-center leading-[14px] flex flex-col items-center`}
					>
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M22.8348 15.6006C21.8977 14.4463 20.4691 13.7148 18.8577 13.7148C17.6463 13.7148 16.5263 14.1377 15.6463 14.8463C14.4577 15.7834 13.7148 17.2348 13.7148 18.8577C13.7148 20.4691 14.4463 21.8977 15.6006 22.8348C16.4806 23.5663 17.6234 24.0006 18.8577 24.0006C20.1606 24.0006 21.3377 23.5091 22.252 22.7206C23.3148 21.772 24.0006 20.4006 24.0006 18.8577C24.0006 17.6234 23.5663 16.4806 22.8348 15.6006ZM20.0348 19.1777C20.0348 19.4748 19.8748 19.7606 19.6234 19.9091L18.012 20.8691C17.8748 20.9491 17.7263 20.9948 17.5663 20.9948C17.2806 20.9948 16.9948 20.8463 16.8348 20.5834C16.5948 20.172 16.7206 19.6463 17.132 19.4063L18.3206 18.6977V17.2577C18.3206 16.7891 18.7091 16.4006 19.1777 16.4006C19.6463 16.4006 20.0348 16.7891 20.0348 17.2577V19.1777Z'
								fill={
									location.pathname === '/matches' && !isDarkMode
										? '#3D82FF'
										: location.pathname === '/matches' && isDarkMode
										? '#6FBBE5'
										: '#697281'
								}
							/>
							<path
								d='M14.5486 4.41143V0.571429C14.5486 0.251429 14.2972 0 13.9772 0H8.88002C8.56002 0 8.30859 0.251429 8.30859 0.571429V4.41143C8.30859 4.73143 8.56002 4.98286 8.88002 4.98286H13.9772C14.2972 4.98286 14.5486 4.73143 14.5486 4.41143Z'
								fill={
									location.pathname === '/matches' && !isDarkMode
										? '#3D82FF'
										: location.pathname === '/matches' && isDarkMode
										? '#6FBBE5'
										: '#697281'
								}
							/>
							<path
								d='M6.00137 0.0228177C3.07566 0.205675 1.07566 1.71425 0.332799 4.22853C0.218513 4.60567 0.492799 4.98282 0.88137 4.98282H6.02423C6.34423 4.98282 6.59566 4.73139 6.59566 4.41139V0.594246C6.59566 0.274246 6.32137 -3.9421e-05 6.00137 0.0228177Z'
								fill={
									location.pathname === '/matches' && !isDarkMode
										? '#3D82FF'
										: location.pathname === '/matches' && isDarkMode
										? '#6FBBE5'
										: '#697281'
								}
							/>
							<path
								d='M16.858 0.011099C19.7837 0.193956 21.7837 1.70253 22.5265 4.21681C22.6408 4.59396 22.3665 4.9711 21.978 4.9711H16.8351C16.5151 4.9711 16.2637 4.71967 16.2637 4.39967V0.582528C16.2637 0.262528 16.538 -0.0117582 16.858 0.011099Z'
								fill={
									location.pathname === '/matches' && !isDarkMode
										? '#3D82FF'
										: location.pathname === '/matches' && isDarkMode
										? '#6FBBE5'
										: '#697281'
								}
							/>
							<path
								d='M22.8571 7.26869V12.2744C22.8571 12.6973 22.4114 12.9716 22.0343 12.7773C21.0743 12.2744 19.9771 12.0001 18.8571 12.0001C17.0171 12.0001 15.2229 12.7544 13.9429 14.0687C12.6857 15.3487 12 17.0516 12 18.8573C12 19.783 12.3657 20.9716 12.8229 21.9658C13.0057 22.3658 12.7314 22.8573 12.2857 22.8573H6.64C2.97143 22.8573 0 19.8858 0 16.2173V7.26869C0 6.94869 0.251429 6.69727 0.571429 6.69727H22.2857C22.6057 6.69727 22.8571 6.94869 22.8571 7.26869Z'
								fill={
									location.pathname === '/matches' && !isDarkMode
										? '#3D82FF'
										: location.pathname === '/matches' && isDarkMode
										? '#6FBBE5'
										: '#697281'
								}
							/>
						</svg>
						<p
							className={`${
								location.pathname === '/matches' && !isDarkMode
									? 'text-[#3D82FF]'
									: location.pathname === '/matches' && isDarkMode
									? 'text-[#6fbbe5]'
									: 'text-[#697281]'
							} mt-[3px] text-[12px] font-bold`}
						>
							История <br />
							игр
						</p>
					</Link>
				</div>
				<div className='flex flex-col items-center'>
					<Link
						to='/faq'
						className={`text-center leading-[14px] flex flex-col items-center`}
					>
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M16.8 0H7.2C2.4 0 0 2.4 0 7.2V22.8C0 23.46 0.54 24 1.2 24H16.8C21.6 24 24 21.6 24 16.8V7.2C24 2.4 21.6 0 16.8 0ZM10.932 17.592C10.632 17.892 10.08 18.168 9.672 18.228L7.176 18.576C7.08 18.588 6.984 18.6 6.9 18.6C6.48 18.6 6.096 18.456 5.82 18.18C5.484 17.844 5.34 17.352 5.424 16.824L5.772 14.328C5.832 13.92 6.108 13.356 6.408 13.068L10.932 8.544C11.004 8.76 11.1 8.976 11.208 9.216C11.316 9.432 11.424 9.648 11.544 9.852C11.64 10.02 11.748 10.188 11.844 10.308C11.964 10.488 12.084 10.644 12.168 10.728C12.216 10.8 12.264 10.848 12.276 10.872C12.54 11.172 12.816 11.46 13.08 11.676C13.152 11.748 13.2 11.784 13.212 11.796C13.368 11.916 13.512 12.048 13.656 12.132C13.812 12.252 13.98 12.36 14.148 12.456C14.352 12.576 14.568 12.696 14.796 12.804C15.024 12.912 15.24 12.996 15.456 13.068L10.932 17.592ZM17.46 11.076L16.524 12.012C16.464 12.072 16.38 12.108 16.296 12.108C16.272 12.108 16.224 12.108 16.2 12.096C14.136 11.508 12.492 9.864 11.904 7.8C11.868 7.692 11.904 7.572 11.988 7.488L12.936 6.54C14.484 4.992 15.948 5.028 17.46 6.54C18.228 7.308 18.612 8.052 18.6 8.82C18.6 9.576 18.228 10.308 17.46 11.076Z'
								fill={
									location.pathname === '/faq' && !isDarkMode
										? '#3D82FF'
										: location.pathname === '/faq' && isDarkMode
										? '#6FBBE5'
										: '#697281'
								}
							/>
						</svg>
						<p
							className={`${
								location.pathname === '/faq' && !isDarkMode
									? 'text-[#3D82FF]'
									: location.pathname === '/faq' && isDarkMode
									? 'text-[#6fbbe5]'
									: 'text-[#697281]'
							} mt-[3px] text-[12px] font-bold `}
						>
							Ответы <br />
							на вопросы
						</p>
					</Link>
				</div>
				<div className='flex flex-col items-center'>
					<Link
						to='/profile'
						className={`text-center leading-[14px] flex flex-col items-center`}
					>
						<svg
							width='22'
							height='24'
							viewBox='0 0 22 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M18.0113 0H3.60225C1.60901 0 0 1.597 0 3.56623V16.6664C0 18.6356 1.60901 20.2326 3.60225 20.2326H4.51482C5.47542 20.2326 6.38799 20.6049 7.06041 21.2773L9.1137 23.3066C10.0503 24.2311 11.5752 24.2311 12.5118 23.3066L14.5651 21.2773C15.2375 20.6049 16.1621 20.2326 17.1107 20.2326H18.0113C20.0045 20.2326 21.6135 18.6356 21.6135 16.6664V3.56623C21.6135 1.597 20.0045 0 18.0113 0ZM10.8068 4.50281C12.3557 4.50281 13.6045 5.75159 13.6045 7.30056C13.6045 8.84953 12.3557 10.0983 10.8068 10.0983C9.25779 10.0983 8.00901 8.83752 8.00901 7.30056C8.00901 5.75159 9.25779 4.50281 10.8068 4.50281ZM14.0248 15.6818H7.58874C6.61613 15.6818 6.05178 14.6011 6.59212 13.7966C7.40863 12.5839 8.99362 11.7674 10.8068 11.7674C12.6199 11.7674 14.2049 12.5839 15.0214 13.7966C15.5617 14.6011 14.9854 15.6818 14.0248 15.6818Z'
								fill={
									location.pathname === '/profile' && !isDarkMode
										? '#3D82FF'
										: location.pathname === '/profile' && isDarkMode
										? '#6FBBE5'
										: '#697281'
								}
							/>
						</svg>
						<p
							className={`${
								location.pathname === '/profile' && !isDarkMode
									? 'text-[#3D82FF]'
									: location.pathname === '/profile' && isDarkMode
									? 'text-[#6fbbe5]'
									: 'text-[#697281]'
							} mt-[3px] text-[12px] font-bold `}
						>
							Профиль
						</p>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Navbar
