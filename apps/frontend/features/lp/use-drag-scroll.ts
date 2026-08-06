"use client";

import { useEffect, useRef } from "react";

type DragScrollOptions = {
  draggingClassName: string;
  speed?: number;
};

export function useDragScroll<T extends HTMLElement>({
  draggingClassName,
  speed = 1,
}: DragScrollOptions) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) {
      return;
    }
    const element: T = currentElement;

    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    function handleMouseDown(event: MouseEvent) {
      dragging = true;
      element.classList.add(draggingClassName);
      startX = event.pageX - element.offsetLeft;
      startScrollLeft = element.scrollLeft;
    }

    function stopDragging() {
      dragging = false;
      element.classList.remove(draggingClassName);
    }

    function handleMouseMove(event: MouseEvent) {
      if (!dragging) {
        return;
      }
      event.preventDefault();
      const currentX = event.pageX - element.offsetLeft;
      element.scrollLeft = startScrollLeft - (currentX - startX) * speed;
    }

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseleave", stopDragging);
    element.addEventListener("mouseup", stopDragging);
    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseleave", stopDragging);
      element.removeEventListener("mouseup", stopDragging);
      element.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draggingClassName, speed]);

  return elementRef;
}
