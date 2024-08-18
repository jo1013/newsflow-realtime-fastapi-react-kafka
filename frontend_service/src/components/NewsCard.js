// src/components/NewsCard.js
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material';
import { recordNewsClick } from '../api/userApi'; // 경로에 따라 변경 가능

function NewsCard({ id, title, imageUrl, source, published_at, onClick }) {
  const navigate = useNavigate();
  const defaultImage = 'https://council.gb.go.kr/images/common/gb_wait.png'; // 기본 이미지 URL

  const handleClick = async () => {
    try {
      const userId = localStorage.getItem('userId'); // userId 가져오기
      await recordNewsClick(userId, id);
      navigate(`/news/${id}`);
    } catch (error) {
      console.error('Error recording news click:', error);
    }
  };
  
  const timeAgo = published_at
    ? formatDistanceToNow(new Date(published_at), { addSuffix: true })
    : 'Date not available';  // 날짜 정보가 없는 경우의 대체 텍스트
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* CardActionArea에 onClick 이벤트 핸들러 추가 */}
      {/* <CardActionArea sx={{ flexGrow: 1 }} onClick={handleClick}>
       */}
      <CardActionArea sx={{ flexGrow: 1 }} onClick={onClick || handleClick}> 
      <CardMedia
        component="img"
        image={imageUrl || defaultImage}
        alt={title}
        sx={{
          height: 140, // 고정된 높이
          objectFit: 'cover', // 컨테이너를 꽉 채우도록 이미지 조정
          width: '100%', // 너비를 100%로 설정
        }}
      />

        
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
            Source: {source}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {timeAgo}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default NewsCard;
