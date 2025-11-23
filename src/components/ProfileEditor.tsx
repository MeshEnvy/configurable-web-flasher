import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";
import { TARGETS } from "../constants/targets";
import { VERSIONS } from "../constants/versions";

interface ProfileEditorProps {
	initialData?: any;
	onSave: () => void;
	onCancel: () => void;
}

export default function ProfileEditor({
	initialData,
	onSave,
	onCancel,
}: ProfileEditorProps) {
	const createProfile = useMutation(api.profiles.create);
	const updateProfile = useMutation(api.profiles.update);

	const { register, handleSubmit, setValue, watch } = useForm({
		defaultValues: initialData || {
			name: "",
			targets: [],
			config: {
				MESHTASTIC_EXCLUDE_MQTT: false,
				MESHTASTIC_EXCLUDE_AUDIO: false,
			},
			version: VERSIONS[0],
		},
	});

	const targets = watch("targets");

	// Group targets by category
	const groupedTargets = React.useMemo(() => {
		return Object.entries(TARGETS).reduce(
			(acc, [id, meta]) => {
				const category = meta.category || "Other";
				if (!acc[category]) acc[category] = [];
				acc[category].push({ id, ...meta });
				return acc;
			},
			{} as Record<string, ((typeof TARGETS)[string] & { id: string })[]>,
		);
	}, []);

	const categories = React.useMemo(
		() => Object.keys(groupedTargets).sort(),
		[groupedTargets],
	);

	const [activeCategory, setActiveCategory] = React.useState<string>(
		categories[0] || "Heltec",
	);

	// Update active category when categories load if not set
	React.useEffect(() => {
		if (!activeCategory && categories.length > 0) {
			setActiveCategory(categories[0]);
		}
	}, [categories, activeCategory]);

	const toggleTarget = (target: string) => {
		const current = targets || [];
		if (current.includes(target)) {
			setValue(
				"targets",
				current.filter((t: string) => t !== target),
			);
		} else {
			setValue("targets", [...current, target]);
		}
	};

	const onSubmit = async (data: any) => {
		if (initialData?._id) {
			await updateProfile({
				id: initialData._id,
				name: data.name,
				targets: data.targets,
				config: data.config,
				version: data.version,
			});
		} else {
			await createProfile(data);
		}
		onSave();
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 bg-slate-900 p-6 rounded-lg border border-slate-800"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium mb-2">Profile Name</label>
					<Input
						{...register("name")}
						className="bg-slate-950 border-slate-800"
						placeholder="e.g. Solar Repeater"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-2">
						Firmware Version
					</label>
					<select
						{...register("version")}
						className="w-full h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950"
					>
						{VERSIONS.map((v) => (
							<option key={v} value={v}>
								{v}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">Targets</label>
				{/* ... existing target UI */}

				<div className="space-y-4">
					{/* Category Pills */}
					<div className="flex flex-wrap gap-2">
						{categories.map((category) => {
							const count = groupedTargets[category].filter((t) =>
								targets?.includes(t.id),
							).length;
							const isActive = activeCategory === category;

							return (
								<button
									key={category}
									type="button"
									onClick={() => setActiveCategory(category)}
									className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
										isActive
											? "bg-blue-600 text-white"
											: "bg-slate-800 text-slate-300 hover:bg-slate-700"
									}`}
								>
									{category}
									{count > 0 && (
										<span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
											{count}
										</span>
									)}
								</button>
							);
						})}
					</div>

					{/* Active Category Targets */}
					<div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
						<div className="flex gap-4 flex-wrap">
							{groupedTargets[activeCategory]?.map((item) => (
								<div key={item.id} className="flex items-center space-x-2">
									<Checkbox
										id={item.id}
										checked={targets?.includes(item.id)}
										onCheckedChange={() => toggleTarget(item.id)}
									/>
									<label
										htmlFor={item.id}
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
									>
										{item.name}
									</label>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					Configuration Flags
				</label>
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="no_mqtt"
							checked={watch("config.MESHTASTIC_EXCLUDE_MQTT")}
							onCheckedChange={(checked) =>
								setValue("config.MESHTASTIC_EXCLUDE_MQTT", checked)
							}
						/>
						<label htmlFor="no_mqtt">Exclude MQTT</label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="no_audio"
							checked={watch("config.MESHTASTIC_EXCLUDE_AUDIO")}
							onCheckedChange={(checked) =>
								setValue("config.MESHTASTIC_EXCLUDE_AUDIO", checked)
							}
						/>
						<label htmlFor="no_audio">Exclude Audio</label>
					</div>
				</div>
			</div>

			<div className="flex gap-2 justify-end">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit">Save Profile</Button>
			</div>
		</form>
	);
}
