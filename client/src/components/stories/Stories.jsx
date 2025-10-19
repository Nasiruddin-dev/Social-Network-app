
import { useContext, useRef, useState, useCallback } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const fileInputRef = useRef();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ["stories"],
    queryFn: () => makeRequest.get("/stories").then((res) => {
      return res.data;
    })
  });

  const mutation = useMutation(
    (img) => makeRequest.post("/stories", { img }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"]);
      },
    }
  );

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddStory = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const base64Img = await toBase64(e.target.files[0]);
        mutation.mutate(base64Img);
      } catch (err) {
        // Optionally show error
      }
      setUploading(false);
    }
  };

  const openViewer = useCallback((index) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => setViewerOpen(false), []);

  const nextStory = useCallback((list) => {
    if (!list || list.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % list.length);
  }, []);

  const prevStory = useCallback((list) => {
    if (!list || list.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  }, []);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e, list) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    // Simple threshold for swipe
    if (dx > 40) {
      prevStory(list);
    } else if (dx < -40) {
      nextStory(list);
    }
    touchStartX.current = null;
  };

  const storiesList = error ? [] : isLoading ? [] : data || [];

  return (
    <div className="stories">
      <div className="story">
        <img
          src={currentUser.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='20'%3E%3F%3C/text%3E%3C/svg%3E"}
          alt={currentUser.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='20'%3E%3F%3C/text%3E%3C/svg%3E";
          }}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleAddStory}
        />
        <button disabled={uploading} onClick={() => fileInputRef.current.click()}>
          {uploading ? "..." : "+"}
        </button>
      </div>
      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : storiesList.map((story, idx) => (
            <div
              className="story clickable"
              key={story.id}
              onClick={() => openViewer(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openViewer(idx);
              }}
            >
              <img
                src={story.img ? story.img : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='30'%3E%3F%3C/text%3E%3C/svg%3E"}
                alt={story.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='30'%3E%3F%3C/text%3E%3C/svg%3E";
                }}
              />
              <span>{story.name}</span>
            </div>
          ))}

      {viewerOpen && storiesList.length > 0 && (
        <div
          className="story-viewer"
          onClick={closeViewer}
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => onTouchEnd(e, storiesList)}
        >
          <div className="viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={closeViewer} aria-label="Close">
              <CloseIcon />
            </button>
            {storiesList.length > 1 && (
              <button
                className="nav prev"
                onClick={() => prevStory(storiesList)}
                aria-label="Previous"
              >
                <ChevronLeftIcon />
              </button>
            )}
            {storiesList.length > 1 && (
              <button
                className="nav next"
                onClick={() => nextStory(storiesList)}
                aria-label="Next"
              >
                <ChevronRightIcon />
              </button>
            )}
            <div className="viewer-header">
              <span className="viewer-name">{storiesList[currentIndex]?.name}</span>
            </div>
            <div className="viewer-body">
              <img
                src={storiesList[currentIndex]?.img}
                alt={storiesList[currentIndex]?.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23ddd' width='400' height='600'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='30'%3E%3F%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
