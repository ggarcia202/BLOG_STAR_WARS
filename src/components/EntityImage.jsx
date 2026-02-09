import { useEffect, useMemo, useState } from "react";
import { getEntityImage, getInternetImageByName } from "../utils/starWars.js";

const PLACEHOLDER_IMAGE = "https://starwars-visualguide.com/assets/img/big-placeholder.jpg";

const getFandomImageCandidates = (name) => {
	if (!name) return [];
	const encodedName = encodeURIComponent(name);
	return [
		`https://starwars.fandom.com/wiki/Special:FilePath/${encodedName}.jpg`,
		`https://starwars.fandom.com/wiki/Special:FilePath/${encodedName}.png`
	];
};

const uniqueUrls = (urls) => {
	return urls.filter((url, index) => Boolean(url) && urls.indexOf(url) === index);
};

export const EntityImage = ({ type, id, name, className = "", alt = "" }) => {
	const primaryImage = useMemo(() => getEntityImage(type, id), [type, id]);
	const [imageSources, setImageSources] = useState([primaryImage, PLACEHOLDER_IMAGE]);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		let isMounted = true;

		const resolveSources = async () => {
			const onlineFallback = await getInternetImageByName(name, type);
			const nextSources = uniqueUrls([
				primaryImage,
				onlineFallback,
				...getFandomImageCandidates(name),
				PLACEHOLDER_IMAGE
			]);

			if (!isMounted) return;
			setImageSources(nextSources);
			setCurrentIndex(0);
		};

		resolveSources();
		return () => {
			isMounted = false;
		};
	}, [name, type, primaryImage]);

	const handleError = () => {
		setCurrentIndex((prevIndex) => {
			if (prevIndex >= imageSources.length - 1) return prevIndex;
			return prevIndex + 1;
		});
	};

	return (
		<img
			src={imageSources[currentIndex]}
			className={className}
			alt={alt || name || "Star Wars image"}
			loading="lazy"
			referrerPolicy="no-referrer"
			onError={handleError}
		/>
	);
};
