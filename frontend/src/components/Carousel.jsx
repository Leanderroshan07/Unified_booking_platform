import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

function CarouselItem({ item, index, itemWidth, round, trackItemOffset, x, transition }) {
    const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
    const outputRange = [90, 0, -90];
    const rotateY = useTransform(x, range, outputRange, { clamp: false });

    return (
        <motion.div
            key={`${item?.id ?? index}-${index}`}
            className={`relative shrink-0 flex flex-col ${round
                ? 'items-center justify-center text-center bg-[#060010] border-0'
                : 'items-start justify-end bg-[#1a1a2e] border border-white/10 rounded-[16px]'
                } overflow-hidden cursor-grab active:cursor-grabbing`}
            style={{
                width: itemWidth,
                height: round ? itemWidth : 280,
                rotateY: rotateY,
                ...(round && { borderRadius: '50%' })
            }}
            transition={transition}
        >
            {/* Background image */}
            {item.image && (
                <div className="absolute inset-0">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/60 to-transparent" />
                </div>
            )}

            {/* Icon badge */}
            <div className="absolute top-4 left-4 z-10">
                <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-orange-500/90 backdrop-blur-sm shadow-lg">
                    {item.icon}
                </span>
            </div>

            {/* Text content at bottom */}
            <div className="relative z-10 p-5 mt-auto">
                <div className="mb-1 font-black text-base text-white">{item.title}</div>
                <p className="text-xs text-white/70 leading-relaxed">{item.description}</p>
            </div>
        </motion.div>
    );
}

export default function Carousel({
    items,
    baseWidth = 300,
    autoplay = false,
    autoplayDelay = 3000,
    pauseOnHover = false,
    loop = false,
    round = false
}) {
    const containerPadding = 16;
    const itemWidth = baseWidth - containerPadding * 2;
    const trackItemOffset = itemWidth + GAP;
    const itemsForRender = useMemo(() => {
        if (!items || items.length === 0) return [];
        if (!loop) return items;
        return [items[items.length - 1], ...items, items[0]];
    }, [items, loop]);

    const [position, setPosition] = useState(loop ? 1 : 0);
    const x = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const containerRef = useRef(null);
    useEffect(() => {
        if (pauseOnHover && containerRef.current) {
            const container = containerRef.current;
            const handleMouseEnter = () => setIsHovered(true);
            const handleMouseLeave = () => setIsHovered(false);
            container.addEventListener('mouseenter', handleMouseEnter);
            container.addEventListener('mouseleave', handleMouseLeave);
            return () => {
                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, [pauseOnHover]);

    useEffect(() => {
        if (!autoplay || itemsForRender.length <= 1) return undefined;
        if (pauseOnHover && isHovered) return undefined;

        const timer = setInterval(() => {
            setPosition(prev => Math.min(prev + 1, itemsForRender.length - 1));
        }, autoplayDelay);

        return () => clearInterval(timer);
    }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

    useEffect(() => {
        if (!items || items.length === 0) return;
        const startingPosition = loop ? 1 : 0;
        setPosition(startingPosition);
        x.set(-startingPosition * trackItemOffset);
    }, [items, loop, trackItemOffset, x]);

    useEffect(() => {
        if (!loop && position > itemsForRender.length - 1) {
            setPosition(Math.max(0, itemsForRender.length - 1));
        }
    }, [itemsForRender.length, loop, position]);

    const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

    const handleAnimationStart = () => {
        setIsAnimating(true);
    };

    const handleAnimationComplete = () => {
        if (!loop || itemsForRender.length <= 1) {
            setIsAnimating(false);
            return;
        }
        const lastCloneIndex = itemsForRender.length - 1;

        if (position === lastCloneIndex) {
            setIsJumping(true);
            const target = 1;
            setPosition(target);
            x.set(-target * trackItemOffset);
            requestAnimationFrame(() => {
                setIsJumping(false);
                setIsAnimating(false);
            });
            return;
        }

        if (position === 0) {
            setIsJumping(true);
            const target = items.length;
            setPosition(target);
            x.set(-target * trackItemOffset);
            requestAnimationFrame(() => {
                setIsJumping(false);
                setIsAnimating(false);
            });
            return;
        }

        setIsAnimating(false);
    };

    const handleDragEnd = (_, info) => {
        const { offset, velocity } = info;
        const direction =
            offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
                ? 1
                : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
                    ? -1
                    : 0;

        if (direction === 0) return;

        setPosition(prev => {
            const next = prev + direction;
            const max = itemsForRender.length - 1;
            return Math.max(0, Math.min(next, max));
        });
    };

    const dragProps = loop
        ? {}
        : {
            dragConstraints: {
                left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
                right: 0
            }
        };

    const activeIndex =
        !items || items.length === 0
            ? 0
            : loop
                ? (position - 1 + items.length) % items.length
                : Math.min(position, items.length - 1);

    if (!items || items.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden p-4 ${round ? 'rounded-full border border-white' : 'rounded-[24px] border border-[#222]'
                }`}
            style={{
                width: `${baseWidth}px`,
                ...(round && { height: `${baseWidth}px` })
            }}
        >
            <motion.div
                className="flex"
                drag={isAnimating ? false : 'x'}
                {...dragProps}
                style={{
                    width: itemWidth,
                    gap: `${GAP}px`,
                    perspective: 1000,
                    perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
                    x
                }}
                onDragEnd={handleDragEnd}
                animate={{ x: -(position * trackItemOffset) }}
                transition={effectiveTransition}
                onAnimationStart={handleAnimationStart}
                onAnimationComplete={handleAnimationComplete}
            >
                {itemsForRender.map((item, index) => (
                    <CarouselItem
                        key={`${item?.id ?? index}-${index}`}
                        item={item}
                        index={index}
                        itemWidth={itemWidth}
                        round={round}
                        trackItemOffset={trackItemOffset}
                        x={x}
                        transition={effectiveTransition}
                    />
                ))}
            </motion.div>
            <div className={`flex w-full justify-center ${round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : ''}`}>
                <div className="mt-4 flex w-[150px] justify-between px-8">
                    {items.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${activeIndex === index
                                ? round
                                    ? 'bg-white'
                                    : 'bg-[#333333]'
                                : round
                                    ? 'bg-[#555]'
                                    : 'bg-[rgba(51,51,51,0.4)]'
                                }`}
                            animate={{
                                scale: activeIndex === index ? 1.2 : 1
                            }}
                            onClick={() => setPosition(loop ? index + 1 : index)}
                            transition={{ duration: 0.15 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
