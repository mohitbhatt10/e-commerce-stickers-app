import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cart-slice";

export default function IncrementDecrementBtnComponent({ product }) {
  const dispatch = useDispatch();

  const cartItem = useSelector((state) =>
    state.cart?.find((item) => item.productId === product.productId)
  );
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () =>
    dispatch(addToCart({ product, quantity: 1 }));

  const handleIncrement = () =>
    dispatch(addToCart({ product, quantity: 1 }));

  const handleDecrement = () =>
    dispatch(addToCart({ product, quantity: -1 }));

  if (quantity <= 0) {
    return (
      <button
        className="bg-primary dark:bg-light text-white dark:text-primary font-medium text-sm py-2 px-4 rounded-md hover:cursor-pointer"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div className="flex items-center bg-primary dark:bg-light text-white dark:text-primary font-medium text-sm rounded-md overflow-hidden shadow-sm">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="px-3 py-2 hover:bg-dark dark:hover:bg-lighter transition-colors"
        onClick={handleDecrement}
      >
        -
      </button>
      <div className="px-3 py-2 border-l border-r border-white/20 dark:border-primary/20 min-w-[2.5rem] text-center">
        {quantity}
      </div>
      <button
        type="button"
        aria-label="Increase quantity"
        className="px-3 py-2 hover:bg-dark dark:hover:bg-lighter transition-colors"
        onClick={handleIncrement}
      >
        +
      </button>
    </div>
  );
}
