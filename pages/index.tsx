// Import necessary icons and React hooks
import { Home, User, Briefcase, Mail, Bell, Smile } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

// ** TypeScript Declaration for window.gsap **
// This tells TypeScript that the 'gsap' property might exist on the window object.
declare global {
	interface Window {
		gsap?: any; // Using 'any' type for simplicity
	}
}

// Define the main App component
export default function App() {
	// Define the alternating dark background colors for sections
	const sectionColors = ["bg-gray-900", "bg-gray-800"];
	// Define number of demo sections
	const numberOfSections = 5;

	// Ref for the blob element
	const blobRef = useRef<HTMLDivElement>(null); // Added type hint for the ref
	// State to track if GSAP is loaded and ready
	const [isGsapReady, setIsGsapReady] = useState(false);
	// Refs to store quickTo functions - Changed specific gsap types to 'any'
	const xTo = useRef<any | null>(null); // Changed from gsap.QuickToFunc
	const yTo = useRef<any | null>(null); // Changed from gsap.QuickToFunc
	// Ref for GSAP context - Changed specific gsap type to 'any'
	const gsapContext = useRef<any | null>(null); // Changed from gsap.Context
	// Ref to track the script tag itself for cleanup
	const scriptTagRef = useRef<HTMLScriptElement | null>(null); // Added type hint

	// Function to initialize GSAP animations once the script is loaded
	const initializeGsap = () => {
		// Ensure window.gsap is available and blobRef is set
		// Add type check for window.gsap
		if (typeof window.gsap !== "undefined" && window.gsap && blobRef.current) {
			// Create GSAP context for cleanup
			gsapContext.current = window.gsap.context(() => {
				// --- GSAP Animations ---

				// 1. Blob Pulsating Animation (Scale)
				window.gsap.to(blobRef.current, {
					scale: 1.2,
					duration: 2,
					repeat: -1,
					yoyo: true,
					ease: "sine.inOut",
				});

				// 2. Blob Color Changing Animation
				const colors = ["#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"];
				window.gsap.to(blobRef.current, {
					backgroundColor: window.gsap.utils.wrap(colors),
					duration: 3,
					repeat: -1,
					yoyo: true,
					ease: "none",
				});

				// 3. Blob Following Cursor Animation Setup (using quickTo)
				// Store quickTo functions in refs
				xTo.current = window.gsap.quickTo(blobRef.current, "x", {
					duration: 0.6,
					ease: "power3",
				});
				yTo.current = window.gsap.quickTo(blobRef.current, "y", {
					duration: 0.6,
					ease: "power3",
				});

				// Set state to indicate GSAP is ready
				console.log("GSAP initialized successfully."); // Add log for debugging
				setIsGsapReady(true);
			}, blobRef); // Scope context to the blob
		} else {
			// Add a delay and retry if gsap isn't immediately available
			console.warn(
				"GSAP not immediately available or blobRef not set. Retrying in 100ms..."
			);
			// Check if the component is still mounted before retrying
			if (blobRef.current) {
				setTimeout(initializeGsap, 100);
			}
		}
	};

	// Effect to load GSAP script dynamically
	useEffect(() => {
		let checkInterval: NodeJS.Timeout | null = null; // Variable to hold interval ID

		// Check if the script already exists (e.g., due to fast refresh)
		const existingScript = document.querySelector(
			'script[src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"]'
		);

		if (existingScript) {
			// If script exists and GSAP is on window, initialize directly
			if (window.gsap) {
				initializeGsap();
			} else {
				// If script exists but GSAP not yet on window, wait for it
				checkInterval = setInterval(() => {
					if (window.gsap) {
						if (checkInterval) clearInterval(checkInterval);
						initializeGsap();
					}
				}, 50);
			}
			// Store ref even if script exists, for potential cleanup
			scriptTagRef.current = existingScript as HTMLScriptElement;
		} else {
			// Create script tag only if it doesn't exist
			const script = document.createElement("script");
			script.src =
				"https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
			script.async = true; // Load asynchronously
			script.onload = initializeGsap; // Initialize GSAP once loaded
			script.onerror = (e) => console.error("GSAP script failed to load:", e); // Add error handling

			// Append script to the document body
			document.body.appendChild(script);
			scriptTagRef.current = script; // Store reference for cleanup
		}

		// Cleanup function for the script tag and interval
		return () => {
			// Clear interval if it's running
			if (checkInterval) {
				clearInterval(checkInterval);
				console.log("GSAP check interval cleared.");
			}
			if (gsapContext.current) {
				gsapContext.current.revert(); // Clean up GSAP animations and context
				console.log("GSAP context reverted.");
			}
		};
	}, []); // Empty dependency array, runs only on mount/unmount

	// Effect for Mouse Tracking (only runs when GSAP is ready)
	useEffect(() => {
		// Only add listener if GSAP is ready and quickTo functions are set
		if (isGsapReady && xTo.current && yTo.current) {
			console.log("Adding mousemove listener."); // Add log
			const handleMouseMove = (event: MouseEvent) => {
				// Added type hint for event
				// Use the stored quickTo functions
				xTo.current?.(event.clientX - 72); // Added optional chaining
				yTo.current?.(event.clientY - 72); // Added optional chaining
			};

			window.addEventListener("mousemove", handleMouseMove);

			// Cleanup function for the event listener
			return () => {
				console.log("Removing mousemove listener."); // Add log
				window.removeEventListener("mousemove", handleMouseMove);
			};
		}
	}, [isGsapReady]); // Dependency array includes isGsapReady

	return (
		// Main container: Full screen, hidden overflow, basic font
		<div className="relative h-screen w-screen overflow-hidden font-sans">
			{/* --- GSAP Script will be loaded dynamically via useEffect --- */}

			{/* --- Animated Cursor Blob --- */}
			<div
				ref={blobRef}
				// Styling for the blob
				className="fixed top-0 left-0 w-36 h-36 rounded-full bg-cyan-500/30 blur-3xl -z-10 pointer-events-none"
			></div>

			{/* Top Fixed Navbar */}
			<nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/30 backdrop-blur-md shadow-sm">
				<div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center space-x-2">
						<Smile className="h-8 w-8 text-blue-600" />
						<span className="text-xl font-bold text-gray-800">Logo</span>
					</div>
					<button
						aria-label="Notifications"
						className="rounded-full p-2 text-gray-600 transition duration-150 ease-in-out hover:bg-gray-200/50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						<Bell className="h-6 w-6" />
					</button>
				</div>
			</nav>

			{/* Scrollable Main Content Area */}
			<main className="hide-scrollbar relative z-0 h-screen overflow-y-scroll snap-y snap-mandatory pt-16 pb-28 scroll-smooth">
				{Array.from({ length: numberOfSections }).map((_, index) => (
					<section
						key={index}
						className={`relative z-10 h-screen snap-start flex items-center justify-center ${
							sectionColors[index % sectionColors.length]
						}`}
					>
						<h2 className="text-4xl font-bold text-gray-200">
							Section {index + 1}
						</h2>
					</section>
				))}
			</main>

			{/* Bottom Floating Navbar */}
			<nav className="fixed bottom-4 left-4 right-4 z-50 h-16 rounded-xl bg-black/30 backdrop-blur-md shadow-lg">
				<div className="mx-auto flex h-full max-w-md items-center justify-around">
					<button
						aria-label="Home"
						className="flex flex-col items-center rounded-md p-2 text-white transition duration-150 ease-in-out hover:text-gray-300 focus:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-black/50"
					>
						<Home className="h-5 w-5" />
						<span className="mt-1 text-xs font-medium">Home</span>
					</button>
					<button
						aria-label="About Me"
						className="flex flex-col items-center rounded-md p-2 text-white transition duration-150 ease-in-out hover:text-gray-300 focus:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-black/50"
					>
						<User className="h-5 w-5" />
						<span className="mt-1 text-xs font-medium">About</span>
					</button>
					<button
						aria-label="Portfolio"
						className="flex flex-col items-center rounded-md p-2 text-white transition duration-150 ease-in-out hover:text-gray-300 focus:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-black/50"
					>
						<Briefcase className="h-5 w-5" />
						<span className="mt-1 text-xs font-medium">Portfolio</span>
					</button>
					<button
						aria-label="Contact Me"
						className="flex flex-col items-center rounded-md p-2 text-white transition duration-150 ease-in-out hover:text-gray-300 focus:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-black/50"
					>
						<Mail className="h-5 w-5" />
						<span className="mt-1 text-xs font-medium">Contact</span>
					</button>
				</div>
			</nav>

			{/* Custom CSS to hide the scrollbar */}
			<style jsx global>{`
				.hide-scrollbar {
					scrollbar-width: none;
					-ms-overflow-style: none;
				}
				.hide-scrollbar::-webkit-scrollbar {
					display: none;
					width: 0;
					height: 0;
					background: transparent;
				}
				body {
					overflow: hidden;
				}
			`}</style>
		</div>
	);
}
