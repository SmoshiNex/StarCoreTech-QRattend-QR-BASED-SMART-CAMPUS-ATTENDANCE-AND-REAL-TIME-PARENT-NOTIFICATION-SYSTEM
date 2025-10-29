import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function ShadcnDemo() {
    return (
        <>
            <Head title="shadcn/ui Demo" />
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            shadcn/ui is Ready! 🎉
                        </h1>
                        <p className="text-muted-foreground">
                            Your Laravel + Inertia + React app now has shadcn/ui components.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Button Variants</h2>
                        <div className="flex flex-wrap gap-4">
                            <Button>Default</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Button Sizes</h2>
                        <div className="flex items-center flex-wrap gap-4">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Add More Components</h2>
                        <div className="bg-card p-6 rounded-lg border">
                            <p className="text-card-foreground mb-4">
                                To add more shadcn/ui components, run:
                            </p>
                            <code className="block bg-muted p-3 rounded text-sm">
                                npx shadcn@latest add [component-name]
                            </code>
                            <p className="text-muted-foreground mt-4 text-sm">
                                Example: npx shadcn@latest add card
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
