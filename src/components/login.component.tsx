import LoginContainer from './login-container.component';
import RegisterContainer from './register-container.component';
import './login/login-style.css';
import { runLoginAnimation } from './login/login-animation';
import { useEffect } from 'react';

export default function Login() {
	useEffect(() => {
    runLoginAnimation();
    return () => {
    };
  }, []);

	return (
			<div className="main">
				<div className="container a-container" id="a-container">
					<LoginContainer />	
				</div>
				<div className="container b-container" id="b-container">
					<RegisterContainer />
				</div>
				<div className="switch" id="switch-cnt">
					<div className="switch__circle"></div>
					<div className="switch__circle switch__circle--t"></div>
					<div className="switch__container" id="switch-c1">
						<h2 className="switch__title title">Welcome Back !</h2>
						<p className="switch__description description">To keep connected with us please login with your personal info</p>
						<button className="switch__button button switch-btn">SIGN UP</button>
					</div>
					<div className="switch__container is-hidden" id="switch-c2">
						<h2 className="switch__title title">Hello Friend !</h2>
						<p className="switch__description description">Enter your personal details and start journey with us</p>
						<button className="switch__button button switch-btn">SIGN IN</button>
					</div>
				</div>
			</div>
	)
}