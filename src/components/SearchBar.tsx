import { Search } from 'lucide-react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
    return (
        <div className="relative w-full max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-ai-accent/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg transition-all duration-300 group-focus-within:bg-white/10 group-focus-within:border-ai-accent/50 group-focus-within:shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-ai-accent transition-colors duration-300" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 h-full bg-transparent border-none outline-none px-3 text-base text-white placeholder:text-gray-500 font-medium"
                />
            </div>
        </div>
    )
}
