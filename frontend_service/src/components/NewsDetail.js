//frontend_service/src/components/NewsDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchNewsDetail } from '../api/newsApi';
import { Button, Container, Typography, Box, Paper, Link, IconButton, Tooltip } from '@mui/material';
import { Twitter, Instagram, Share, ContentCopy } from '@mui/icons-material';

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsDetail, setNewsDetail] = useState(null);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');


  useEffect(() => {
    const loadNewsDetail = async () => {
      try {
        const data = await fetchNewsDetail(id);
        setNewsDetail(data);
      } catch (error) {
        setError(`뉴스 상세 정보를 가져오는데 실패했습니다. ${error.message}`);
      }
    };

    loadNewsDetail();
  }, [id]);

  // 클립보드에 본문 내용을 복사하는 함수
  const handleCopyToClipboard = () => {
    if (newsDetail && newsDetail.description) {
      navigator.clipboard.writeText(newsDetail.description).then(() => {
        alert('본문 내용이 클립보드에 복사되었습니다.');
      }).catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
    } else {
      alert('복사할 내용이 없습니다.');
    }
  };



  const handleShare = (platform) => {
    const shareLink = window.location.href;
    const encodedLink = encodeURIComponent(shareLink);
    let url = '';

    switch (platform) {

      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedLink}`;
        break;
      case 'instagram':
        alert('Instagram does not support direct sharing via URL. Please use a screenshot.');
        return;
      default:
        break;
    }

    window.open(url, '_blank');
  };


  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!newsDetail) {
    return <Typography>로딩 중...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>이전 페이지로 돌아가기</Button>
        <Paper elevation={3} sx={{ my: 2, p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {newsDetail.title}
          </Typography>
          <img src={newsDetail.image || '기본 이미지 URL'} alt={newsDetail.title} style={{ width: '100%', height: 'auto' }} />
          <Typography paragraph sx={{ mt: 2 }}>
            {newsDetail.description}
          </Typography>
          <Link href={newsDetail.url} target="_blank" rel="noopener noreferrer" variant="body2">
            원문 보기
          </Link>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Tooltip title="클립보드에 복사">
            <IconButton onClick={handleCopyToClipboard}>
              <ContentCopy />
            </IconButton>
          </Tooltip>
          <Box>
            <Tooltip title="트위터 공유">
              <IconButton onClick={() => handleShare('twitter')}>
                <Twitter />
              </IconButton>
            </Tooltip>
            <Tooltip title="인스타그램 공유">
              <IconButton onClick={() => handleShare('instagram')}>
                <Instagram />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default NewsDetail;

