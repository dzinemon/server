import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Desktop dropdown menu component
 * @param {Object} props - Component props
 * @param {string} props.label - Dropdown label text
 * @param {Array} props.items - Array of menu items with name and slug properties
 * @param {boolean} props.isOpen - Is dropdown open state
 * @param {Function} props.toggleDropdown - Function to toggle dropdown state
 * @param {string} props.pathname - Current pathname for active link styling
 * @param {Function} props.closeDropdown - Function to close dropdown
 * @param {string} props.id - Unique identifier for the dropdown
 */
export const NavDropdown = ({ label, items, isOpen, toggleDropdown, pathname, closeDropdown, id }) => {
  return (
    <div className="relative">
      <button
        id={`${id}-dropdown-trigger`}
        type="button"
        className="text-kruze-dark hover:text-kruze-blueLight text-sm font-semibold leading-6 text-gray-900 flex items-center gap-x-1"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
      >
        {label}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div id={`${id}-dropdown`} className="absolute z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {items.map((item, idx) => (
            <Link
              key={`${id}-item-${idx}`}
              href={`/${item.slug}`}
              className={`${
                pathname === `/${item.slug}`
                  ? 'bg-gray-100 text-kruze-blueDark'
                  : 'text-gray-700'
              } block px-4 py-2 text-sm hover:bg-gray-100`}
              onClick={closeDropdown}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Mobile navigation section component
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {Array} props.items - Array of menu items with name and slug properties
 * @param {string} props.pathname - Current pathname for active link styling
 * @param {Function} props.onItemClick - Function to execute when an item is clicked
 */
export const MobileNavSection = ({ title, items, pathname, onItemClick }) => {
  return (
    <div className="mt-2 pt-2 border-t border-gray-200">
      <div className="-mx-3 px-3 py-2 text-base font-semibold leading-7 text-gray-900">
        {title}
      </div>
      {items.map((item, idx) => (
        <Link
          key={`mobile-${title.toLowerCase()}-${idx}`}
          href={`/${item.slug}`}
          className={`${
            pathname === `/${item.slug}`
              ? 'underline pointer-events-none'
              : ''
          } -mx-3 block rounded-lg px-6 py-1 text-base leading-7 text-gray-700 hover:bg-gray-50`}
          onClick={onItemClick}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

/**
 * Hook for creating and managing dropdown states
 * Ensures only one dropdown is open at a time
 * @param {Array} dropdownIds - Array of dropdown IDs
 * @returns {Object} - Object containing dropdown states and handlers
 */
export const useNavDropdowns = (dropdownIds) => {
  // Create state for each dropdown
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownStates = dropdownIds.reduce((acc, id) => {
    acc[id] = openDropdown === id;
    return acc;
  }, {});

  // Create toggle functions for each dropdown
  const toggleFunctions = dropdownIds.reduce((acc, id) => {
    acc[id] = () => {
      setOpenDropdown(openDropdown === id ? null : id);
    };
    return acc;
  }, {});

  // Create close functions for each dropdown
  const closeFunctions = dropdownIds.reduce((acc, id) => {
    acc[id] = () => {
      setOpenDropdown(null);
    };
    return acc;
  }, {});

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openDropdown) return;
      
      const dropdownElement = document.getElementById(`${openDropdown}-dropdown`);
      const triggerElement = document.getElementById(`${openDropdown}-dropdown-trigger`);
      
      if (
        dropdownElement && 
        !dropdownElement.contains(event.target) && 
        !triggerElement?.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  return {
    dropdownStates,
    toggleDropdown: (id) => toggleFunctions[id](),
    closeDropdown: (id) => closeFunctions[id](),
    isOpen: (id) => dropdownStates[id],
  };
};

/**
 * Hook for handling dropdown closing when clicking outside (legacy support)
 * @param {Array} dropdownStates - Array of objects with state and id
 */
export const useOutsideClickHandler = (dropdownStates) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      dropdownStates.forEach(({ isOpen, setIsOpen, id }) => {
        if (isOpen) {
          const dropdownElement = document.getElementById(`${id}-dropdown`)
          const triggerElement = document.getElementById(`${id}-dropdown-trigger`)
          if (
            dropdownElement && 
            !dropdownElement.contains(event.target) && 
            !triggerElement?.contains(event.target)
          ) {
            setIsOpen(false)
          }
        }
      })
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [dropdownStates])
}
