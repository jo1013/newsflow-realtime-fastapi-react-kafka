// frontend_service/src/pages/NewsPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import SearchPage from '../components/SearchPage';
import { fetchNews } from '../api/newsApi';
import { fetchSubscribedNewsApi } from '../api/subscribedNewsApi';
import { Container, Typography, Tabs, Tab, Box, Grid, Button } from '@mui/material';
// NewsPage 컴포넌트 정의
function NewsPage() {
    // 상태 변수 정의
    const [newsData, setNewsData] = useState([]); // 뉴스 데이터 저장
    const [subscribedNews, setSubscribedNews] = useState([]); // 구독한 뉴스 데이터 저장
    const [tabValue, setTabValue] = useState(0); // 현재 선택된 탭 인덱스 저장
    const [page, setPage] = useState(1); // 현재 뉴스 페이지 번호 저장
    const [subscribedPage, setSubscribedPage] = useState(1); // 현재 구독 뉴스 페이지 번호 저장
    const [loading, setLoading] = useState(false); // 데이터 로딩 상태 저장
    const [hasMore, setHasMore] = useState(true); // 추가 뉴스 데이터 존재 여부 저장
    const [subscribedHasMore, setSubscribedHasMore] = useState(true); // 추가 구독 뉴스 데이터 존재 여부 저장
    const loader = useRef(null); // 뉴스 로더 요소 참조 저장
    const subscribedLoader = useRef(null); // 구독 뉴스 로더 요소 참조 저장
    const navigate = useNavigate(); // 페이지 네비게이션 함수 저장

    // 로그아웃 핸들러 추가
    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.href = '/login'; // 페이지를 완전히 새로고침합니다.
    };

    // 뉴스 카드 클릭 핸들러
    const handleCardClick = (newsId) => {
        navigate(`/news/${newsId}`); // 뉴스 상세 페이지로 이동
    };

    // 로그아웃 핸들러
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            window.location.href = '/login';
        }
    }, []); // 빈 의존성 배열
    // 구독 목록 페이지로 이동하는 핸들러
    const handleSubscriptionList = () => {
        navigate('/subscriptions'); // 구독 목록 페이지로 이동
    };

    // 뉴스 데이터를 로드하는 useEffect
    useEffect(() => {
        if (!hasMore || loading || tabValue !== 0) return; // 추가 데이터가 없거나 로딩 중이거나 현재 탭이 'All News'가 아니면 리턴

        setLoading(true); // 로딩 상태 설정
        const loadData = async () => {
            try {
                const data = await fetchNews(page); // 뉴스 데이터 가져오기
                if (data && data.newsList.length > 0) {
                    // setNewsData(prev => [...prev, ...data.newsList]); // 뉴스 데이터 업데이트
                    setNewsData(prev => (page === 1 ? data.newsList : [...prev, ...data.newsList])); // 뉴스 데이터 업데이트
                    setPage(prev => prev + 1);  // 데이터 로딩 후 페이지 번호 증가
                } else {
                    setHasMore(false); // 추가 데이터 없음 설정
                }
            } catch (error) {
                console.error('데이터 로딩 실패:', error); // 에러 출력
            } finally {
                setLoading(false); // 로딩 상태 해제
            }
        };
        loadData(); // 데이터 로드 함수 호출
    }, [page, hasMore, loading, tabValue]);

    // 뉴스 무한 스크롤을 위한 IntersectionObserver 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && tabValue === 0) {
                    setPage(prev => prev + 1); // 페이지 증가
                }
            },
            { threshold: 0.1 }
        );
        if (loader.current) {
            observer.observe(loader.current); // 로더 요소 관찰 시작
        }
        return () => {
            if (loader.current) {
                observer.unobserve(loader.current); // 로더 요소 관찰 중지
            }
        };
    }, [loader, hasMore, loading, tabValue]);

    // 구독 뉴스 데이터를 로드하는 useEffect
    useEffect(() => {
        if (!subscribedHasMore || loading || tabValue !== 2) return; // 추가 데이터가 없거나 로딩 중이거나 현재 탭이 'Subscribed News'가 아니면 리턴

        setLoading(true); // 로딩 상태 설정
        const loadSubscribedData = async () => {
            try {
                const data = await fetchSubscribedNewsApi(subscribedPage); // 구독 뉴스 데이터 가져오기
                if (data && data.length > 0) {
                    // setSubscribedNews(prev => [...prev, ...data]); // 구독 뉴스 데이터 업데이트
                    setSubscribedNews(prev => (subscribedPage === 1 ? data : [...prev, ...data])); // 구독 뉴스 데이터 업데이트
                    setSubscribedPage(prev => prev + 1);  // 데이터 로딩 후 페이지 번호 증가
                } else {
                    setSubscribedHasMore(false); // 추가 데이터 없음 설정
                }
            } catch (error) {
                console.error('구독 뉴스 데이터 로딩 실패:', error); // 에러 출력
            } finally {
                setLoading(false); // 로딩 상태 해제
            }
        };
        loadSubscribedData(); // 데이터 로드 함수 호출
    }, [subscribedPage, subscribedHasMore, loading, tabValue]);

    // 구독 뉴스 무한 스크롤을 위한 IntersectionObserver 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && subscribedHasMore && !loading && tabValue === 2) {
                    setSubscribedPage(prev => prev + 1); // 페이지 증가
                }
            },
            { threshold: 0.1 }
        );
        if (subscribedLoader.current) {
            observer.observe(subscribedLoader.current); // 로더 요소 관찰 시작
        }
        return () => {
            if (subscribedLoader.current) {
                observer.unobserve(subscribedLoader.current); // 로더 요소 관찰 중지
            }
        };
    }, [subscribedLoader, subscribedHasMore, loading, tabValue]);

    // 탭 변경 핸들러
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue); // 선택된 탭 인덱스 업데이트
        if (newValue === 0) {
            setPage(1); // 페이지 초기화
            setNewsData([]); // 뉴스 데이터 초기화
            setHasMore(true); // 더 가져올 데이터가 있다고 설정
        } else if (newValue === 2) {
            setSubscribedPage(1); // 구독 뉴스 페이지 초기화
            setSubscribedNews([]); // 구독 뉴스 데이터 초기화
            setSubscribedHasMore(true); // 더 가져올 구독 뉴스가 있다고 설정
        }
    };

    // 컴포넌트 렌더링
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">Latest News</Typography>
            <Button variant="contained" color="primary" onClick={handleLogout} sx={{ mr: 2, mb: 2 }}>Logout</Button>
            <Button variant="contained" color="secondary" onClick={handleSubscriptionList} sx={{ mb: 2 }}>Subscription List</Button>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                    <Tab label="All News" />
                    <Tab label="Search" />
                    <Tab label="Subscribed News" />
                </Tabs>
            </Box>
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    {newsData.map(news => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={news._id}>
                            <NewsCard
                                id={news._id}
                                title={news.title}
                                imageUrl={news.image}
                                source={news.source}
                                published_at={news.published_at}
                                onClick={() => handleCardClick(news._id)} // 클릭 이벤트 핸들러 추가
                            />
                        </Grid>
                    ))}
                   
                     {hasMore && <div ref={loader} />}  
                </Grid>
            )}
            {tabValue === 1 && <SearchPage newsData={newsData} />}
            {tabValue === 2 && (
                <Grid container spacing={4}>
                    {subscribedNews.map(news => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={news._id}>
                            <NewsCard
                                id={news._id}
                                title={news.title}
                                imageUrl={news.image}
                                source={news.source}
                                published_at={news.published_at}
                                onClick={() => handleCardClick(news._id)}
                            />
                        </Grid>
                    ))}
                    {subscribedHasMore && (
                        <div ref={subscribedLoader} style={{ height: '20px', margin: '20px 0' }}>
                            <Typography align="center">Loading more subscribed news...</Typography>
                        </div>
                    )}
                </Grid>
            )}
        </Container>
    );
}

export default NewsPage;