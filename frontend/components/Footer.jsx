import React from "react";

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-gray-300 py-4 text-center mt-10">
            <p className="text-sm">
                © {new Date().getFullYear()} Infosys Project • All Rights Reserved
            </p>
        </footer>
    );
}
